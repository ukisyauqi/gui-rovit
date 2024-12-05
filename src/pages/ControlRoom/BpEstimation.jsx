import {
  Box,
  Button,
  Center,
  flattenTokens,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Input,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  scaleFadeConfig,
  Spacer,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { writeRTDB, rtdb, storage } from "../../firebase";
import { onValue, ref } from "firebase/database";
import { getDownloadURL } from "firebase/storage";
import { Line } from "react-chartjs-2";
import axios from 'axios';
import { SENSOR_NAME, SERVICE_UUID, SENSOR_CHARACTERISTIC_UUID } from "../../util/alat_sensor_utility";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ModalScanSensor from "../../../archive/ModalScanSensor";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpeechSynthesis } from "react-speech-kit";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const placeholderChart = {
  labels: [0],
  datasets: [
    {
      label: "PPG Signal",
      data: [0],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

export default function BpEstimation() {
  const toast = useToast();
  const { speak, voices } = useSpeechSynthesis();

  // react states
  const [inputName, setInputName] = useState("");
  const [inputAge, setInputAge] = useState("");
  const [inputWeight, setInputWeight] = useState("");
  const [inputTemperature, setInputTemperature] = useState("");
  const [inputSystole, setInputSystole] = useState("");
  const [inputDiastole, setInputDiastole] = useState("");
  const [chartData, setChartData] = useState(placeholderChart);
  const [result, setResult] = useState({
    systole: "",
    diastole: "",
    bpm: "",
    ibi: "",
    sdnn: "",
    rmssd: "",
    sdsd: "",
  });
  const btnRefEstimateBpStart = useRef(null);
  const isRecording = useRef(false);
  const [suhu, setSuhu] = useState(0);
  const signal = useRef(Array(2000).fill(0));
  const [isSensorConnected, setIsSensorConnected] = useState(false);

  // helper functions
  function getTimeStamp() {
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

  const startAmbilData = () => {
    axios.post("https://api.ppg.millenia911.net", { "age": parseInt(inputAge), "weight": parseInt(inputWeight), "ppg": signal.current.map((str) => parseFloat(str, 10)) })
      .then((response) => {
        console.log(response.data)
        writeRTDB("data/" + getTimeStamp(), {
          nama: inputName,
          umur: inputAge,
          weight: inputWeight,
          temperature: inputTemperature,
          inputSystole: inputSystole,
          inputDiastole: inputDiastole,
          systole: response.data.estimated_systole,
          diastole: response.data.estimated_diastole,
          respiration: response.data.estimated_respiratory_rate,
          sinyal: signal.current,
          bpm: response.data.bpm,
          ibi: response.data.ibi,
          sdnn: response.data.sdnn,
          rmssd: response.data.rmssd,
          sdsd: response.data.sdsd,
        })
        setResult({
          nama: inputName,
          umur: inputAge,
          weight: inputWeight,
          temperature: inputTemperature,
          inputSystole: inputSystole,
          inputDiastole: inputDiastole,
          systole: response.data.estimated_systole,
          diastole: response.data.estimated_diastole,
          respiration: response.data.estimated_respiratory_rate,
          sinyal: signal.current,
          bpm: response.data.bpm,
          ibi: response.data.ibi,
          sdnn: response.data.sdnn,
          rmssd: response.data.rmssd,
          sdsd: response.data.sdsd,
        })
        toast({
          title: "Estimate BP Success",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      })
      .catch(function (error) {
        console.log(error);
        toast({
          title: "Estimate BP Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      });
  };

  // USE EFFECTS
  useEffect(() => {
    const unsubscribes = [];

    unsubscribes.push(
      onValue(ref(rtdb, "L5W1D/suhu"), (snapshot) => {
        const data = snapshot.val();
        setSuhu(data.toFixed(2));
      })
    );

    return () => {
      unsubscribes.map((unsubscribe) => unsubscribe());
    };
  }, []);

  const deviceName = "ESP32";
  const bleService = "19b10000-e8f2-537e-4f6c-d104768a1215";
  const sensorCharacteristic = "19b10001-e8f2-537e-4f6c-d104768a1215";

  var bleServer;
  var bleServiceFound;
  var sensorCharacteristicFound;

  let i = 0;
  let disconnectTimeout;
  let newValueReceived

  function handleCharacteristicChange(event) {
    newValueReceived = new TextDecoder().decode(event.target.value);
    // console.log(newValueReceived);
    setIsSensorConnected(true)
    signal.current.push(newValueReceived);
    signal.current.shift();
    i++;

    if (i % 50 === 0) {
      clearTimeout(disconnectTimeout)
      disconnectTimeout = setTimeout(() => {
        setIsSensorConnected(false)
        toast({
          title: "Sensor Disconected",
          status: "error",
          duration: 1000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload()
        }, 2000);
      }, 1000);

      i = 0;
      setChartData({
        labels: [],
        datasets: [
          {
            label: "PPG signal",
            data: signal.current.reduce((acc, value, index) => {
              acc[index] = value;
              return acc;
            }, {}),
            borderWidth: 2,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            pointRadius: 1,
          },
        ],
      });
    }
  }

  const estimateBPError = () => {
    isRecording.current = false;
    toast({
      title: window.messageError ?? "error",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  function onDisconnected(event) {
    console.log('Device Disconnected:', event.target.device.name);
    window.location.reload()
  }

  function connectToDevice() {
    let sensorIndex
    console.log("Initializing Bluetooth...");
    navigator.bluetooth
      .requestDevice({
        filters: SENSOR_NAME.map(name => ({ name })),
        optionalServices: SERVICE_UUID 
      })
      .then((device) => {
        console.log("Device Selected:", device.name);
        sensorIndex = SENSOR_NAME.indexOf(device.name)
        device.addEventListener("gattservicedisconnected", onDisconnected);
        return device.gatt.connect();
      })
      .then((gattServer) => {
        bleServer = gattServer;
        console.log("Connected to GATT Server");
        return bleServer.getPrimaryService(SERVICE_UUID[sensorIndex]);
      })
      .then((service) => {
        bleServiceFound = service;
        console.log("Service discovered:", service.uuid);
        return service.getCharacteristic(SENSOR_CHARACTERISTIC_UUID[sensorIndex]);
      })
      .then((characteristic) => {
        console.log("Characteristic discovered:", characteristic.uuid);
        sensorCharacteristicFound = characteristic;
        characteristic.addEventListener(
          "characteristicvaluechanged",
          handleCharacteristicChange
        );
        characteristic.startNotifications();
        console.log("Notifications Started.");
        return characteristic.readValue();
      })
      .then((value) => {
        console.log("Read value: ", value);
        const decodedValue = new TextDecoder().decode(value);
        console.log("Decoded value: ", decodedValue);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }

  return (
    <>
      <div style={{ display: "none" }}>
        <button id="estimateBPStart" ref={btnRefEstimateBpStart}></button>
        <button id="estimateBPError" onClick={estimateBPError}></button>
        <p id="ppg"></p>
        <p id="systole"></p>
        <p id="diastole"></p>
      </div>

      {/* <Center
        position={"fixed"}
        top={0}
        left={0}
        w={"full"}
        h={"100vh"}
        backdropFilter={"blur(3px)"}
        zIndex={100}
        id="preparingEnvironment"
      >
        <Button
          background={"teal"}
          p={10}
          rounded={"xl"}
          shadow={"2xl"}
          isLoading
          loadingText="Preparing Environment"
          colorScheme="teal"
          size={"lg"}
        ></Button>
      </Center> */}

      <Grid
        templateColumns={{ base: "", md: "auto 1fr 1fr" }}
        templateRows={{ base: "", md: "1fr auto" }}
        gap={{ sm: 3, md: 5, lg: 6 }}
        p={{ sm: 3, md: 5, lg: 6 }}
        minH="100vh"
      >
        <GridItem
          colSpan={{ base: 1, md: 3 }}
          bg="white"
          py={5}
          px={6}
          rounded="md"
          shadow="md"
        >
          <Heading fontSize="xl" fontWeight="semibold" mb={4}>
            Grafik Sinyal Photoplethysmograph (PPG)
          </Heading>
          <Line options={{ animation: false }} data={chartData} />
        </GridItem>

        <GridItem
          colSpan={1}
          bg="white"
          py={4}
          px={6}
          rounded="md"
          mt={{ base: 5, md: 0 }}
          shadow="md"
          width={{ base: "100vw", md: "fit-content" }}
        >
          <Flex justifyContent="space-between">
            <Heading fontSize="xl" fontWeight="semibold" mb={2}>
              Aksi
            </Heading>
            <Button
              onClick={() => {
                connectToDevice();
              }}
              size="sm"
              variant="link"
              colorScheme="teal"
              mb={2}
            >
              {isSensorConnected ? "Connected" : "Connect to Sensor"}
            </Button>
          </Flex>
          <Input
            placeholder="Masukan Nama Responden"
            shadow={"sm"}
            value={inputName}
            onChange={(event) => setInputName(event.target.value)}
          />

          <Flex mt={2}>
            <Input
              placeholder="Usia"
              shadow={"sm"}
              value={inputAge}
              onChange={(event) => setInputAge(event.target.value)}
              w={140}
            />
            <Input
              w={150}
              placeholder="Berat Badan"
              shadow={"sm"}
              value={inputWeight}
              onChange={(event) => setInputWeight(event.target.value)}
            />
          </Flex>
          {/* <Flex mt={2} visibility={"hidden"}> */}
          <Flex mt={2}>
            <Input
              placeholder="Actual Systole"
              shadow={"sm"}
              value={inputSystole}
              onChange={(event) => setInputSystole(event.target.value)}
            />
            <Box w={2}></Box>
            <Input
              placeholder="Actual Diastole"
              shadow={"sm"}
              value={inputDiastole}
              onChange={(event) => setInputDiastole(event.target.value)}
            />
          </Flex>
          <Flex mt={2}>
            <Button colorScheme="teal" w="full" onClick={startAmbilData}>
              Mulai Estimasi
            </Button>
          </Flex>
        </GridItem>

        <GridItem
          colSpan={1}
          bg="white"
          py={5}
          px={6}
          rounded="md"
          mt={{ base: 5, md: 0 }}
          shadow="md"
        >
          <Heading fontSize="xl" fontWeight="semibold" mb={4}>
            Hasil estimasi
          </Heading>
          <Text align={"center"} my={{ base: 10, md: 16 }} fontSize={"lg"}>
            Systole: <b>{result?.systole}</b>
            <br />
            Diastole: <b>{result?.diastole}</b>
            <br />
            Respiration: <b>{result?.respiration}</b>
            <br />
            {/* {suhu ? "Suhu: " + suhu : ""} */}
          </Text>
        </GridItem>

        <GridItem
          colSpan={1}
          bg="white"
          py={5}
          px={6}
          rounded="md"
          my={{ base: 5, md: 0 }}
          shadow="md"
        >
          <Heading fontSize="xl" fontWeight="semibold" mb={4}>
            PPG Extraction
          </Heading>
          <Text
            mt={8}
            fontSize={"lg"}
            fontStyle={"italic"}
            ml={16}
            mb={{ base: 10, md: 0 }}
          >
            bpm: {result?.bpm}
            <br />
            ibi: {result?.ibi}
            <br />
            sdnn: {result?.sdnn}
            <br />
            rmssd: {result?.rmssd}
            <br />
            sdsd: {result?.sdsd}
          </Text>
        </GridItem>
      </Grid>
    </>
  );
}
