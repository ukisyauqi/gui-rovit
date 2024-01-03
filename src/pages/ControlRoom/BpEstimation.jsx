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
    mad: "",
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
    axios.post("https://api.ppg.ctailab.com/api/process-data", { "age": inputAge, "weight": inputWeight, "ppg": signal.current.map((str) => parseFloat(str, 10)) })
      .then((response) => {
        writeRTDB("data/" + getTimeStamp(), {
          nama: inputName,
          umur: inputAge,
          weight: inputWeight,
          temperature: inputTemperature,
          inputSystole: inputSystole,
          inputDiastole: inputDiastole,
          systole: response.data.estimated_systole,
          diastole: response.data.estimated_diastole,
          sinyal: signal.current,
          bpm: response.data.bpm,
          ibi: response.data.ibi,
          sdnn: response.data.sdnn,
          rmssd: response.data.rmssd,
          mad: response.data.hr_mad,
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
          sinyal: signal.current,
          bpm: response.data.bpm,
          ibi: response.data.ibi,
          sdnn: response.data.sdnn,
          rmssd: response.data.rmssd,
          mad: response.data.hr_mad,
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

  function handleCharacteristicChange(event) {
    const newValueReceived = new TextDecoder().decode(event.target.value);
    // console.log(newValueReceived);
    signal.current.push(newValueReceived);
    signal.current.shift();
    i++;

    if (i % 50 === 0) {
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
    connectToDevice();
  }

  function connectToDevice() {
    console.log("Initializing Bluetooth...");
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [bleService],
      })
      .then((device) => {
        console.log("Device Selected:", device.name);
        device.addEventListener("gattservicedisconnected", onDisconnected);
        return device.gatt.connect();
      })
      .then((gattServer) => {
        bleServer = gattServer;
        console.log("Connected to GATT Server");
        return bleServer.getPrimaryService(bleService);
      })
      .then((service) => {
        bleServiceFound = service;
        console.log("Service discovered:", service.uuid);
        return service.getCharacteristic(sensorCharacteristic);
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
        {/* <div dangerouslySetInnerHTML={{ __html: myHtml }}></div> */}
        <button id="estimateBPStart" ref={btnRefEstimateBpStart}></button>
        {/* <button id="estimateBPFinish" onClick={estimateBPFinish}></button> */}
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
        >
          <Flex justifyContent="space-between">
            <Heading fontSize="xl" fontWeight="semibold" mb={2}>
              Aksi
            </Heading>
            <Button
              onClick={() => {
                connectToDevice();
                setIsSensorConnected(true);
              }}
              size="sm"
              variant="link"
              colorScheme="teal"
              mb={2}
            >
              Connect to Sensor
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
            <Input
              w={150}
              placeholder="Suhu Tubuh"
              shadow={"sm"}
              value={inputTemperature}
              onChange={(event) => setInputTemperature(event.target.value)}
            />
          </Flex>
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
              Rekam PPG
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
            {suhu ? "Suhu: " + suhu : ""}
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
            mad: {result?.mad}
          </Text>
        </GridItem>
      </Grid>
    </>
  );
}
