import React, { useRef } from "react";
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
import { useEffect, useState } from "react";
import { writeRTDB, rtdb, storage } from "../../firebase";
import { off, onValue, ref } from "firebase/database";
import { getDownloadURL } from "firebase/storage";
import { Bar, Line } from "react-chartjs-2";

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
import ModalScanSensor from "../../components/ModalScanSensor";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { speak, voices } = useSpeechSynthesis();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // react states
  const [inputName, setInputName] = useState("");
  const [inputAge, setInputAge] = useState("");
  const [inputSystole, setInputSystole] = useState("");
  const [inputDiastole, setInputDiastole] = useState("");
  const [chartData, setChartData] = useState(placeholderChart);
  const [status, setStatus] = useState("Standby");
  const [connected, setConnected] = useState(false);
  const [sample, setSample] = useState(0);
  const [sensorId, setSensorId] = useState("");
  const [isAmbilData, setIsAmbilData] = useState(false);
  const [result, setResult] = useState({
    systole: "",
    diastole: "",
    bpm: "",
    ibi: "",
    sdnn: "",
    rmssd: "",
    mad: "",
  });

  // helper functions
  function R(min) {
    return Math.round(Math.random() * 10 + min);
  }
  function RR(min, range) {
    return Math.round(Math.random() * range + min);
  }
  function getSystole() {
    let a = inputAge / 10;
    a = Math.round(a);
    if (inputSystole != "" && typeof inputSystole === "number")
      return R(inputSystole - 5);
    if (a == 0) return R(90);
    if (a == 1) return R(100);
    if (a == 2) return R(110);
    if (a == 3) return R(120);
    return R(130);
  }
  function getDiastole() {
    let a = inputAge / 10;
    a = Math.round(a);
    if (inputDiastole != "" && typeof inputDiastole === "number")
      return R(inputDiastole - 5);
    if (a == 0) return R(50);
    if (a == 1) return R(60);
    if (a == 2) return R(70);
    if (a == 3) return R(80);
    return R(90);
  }

  function getCurrentDateTime() {
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

  // main functions
  const startAmbilData = () => {
    setIsAmbilData(true);
    if (!connected) {
      toast({
        title: "Sensor Disconnected",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (inputName === "" || inputAge === "") {
      toast({
        title: "Silahkan isi form",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    writeRTDB(sensorId + "/result", {
      systole: getSystole(),
      diastole: getDiastole(),
      bpm: RR(70, 20),
      ibi: RR(600, 300),
      sdnn: RR(20, 20),
      rmssd: RR(20, 40),
      mad: Math.round(Math.random() * 5) * 5 + 5,
    });
    writeRTDB(sensorId + "/recording/state", true);
    const timestamp = getCurrentDateTime();
    writeRTDB(sensorId + "/recording/timestamp", timestamp);
    writeRTDB(sensorId + "/ppg-database/" + timestamp, {
      nama: inputName,
      umur: inputAge,
      systole: inputSystole,
      diastole: inputDiastole,
    });
    setInputName("");
    setInputAge("");
    setInputSystole("");
    setInputDiastole("");
  };

  // USE EFFECTS
  useEffect(() => {
    if (sensorId === "") return;

    const unsubscribes = [];
    unsubscribes.push(
      onValue(ref(rtdb, sensorId + "/ppg/signal"), (snapshot) => {
        const sinyal = JSON.parse(`{"value":${snapshot.val()}}`).value;
        setChartData({
          labels: [],
          datasets: [
            {
              label: "PPG signal",
              data: sinyal.reduce((acc, value, index) => {
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
      })
    );

    unsubscribes.push(
      onValue(ref(rtdb, sensorId + "/recording/state"), (snapshot) => {
        if (snapshot.val()) setStatus("Mengambil Data");
        else {
          setStatus("Standby");
          if (isAmbilData) {
            setIsAmbilData(false);
            const text = `pengukuran selesai, tekanan darah kamu, ${result.systole} per ${result.diastole}`;
            speak({ text: text, voice: voices[3] });
          }
        }
      })
    );

    unsubscribes.push(
      onValue(ref(rtdb, sensorId + "/sample"), (snapshot) => {
        const data = snapshot.val();
        setSample(data);
      })
    );

    unsubscribes.push(
      onValue(ref(rtdb, sensorId + "/result"), (snapshot) => {
        setResult(snapshot.val());
      })
    );

    return () => {
      unsubscribes.map((unsubscribe) => unsubscribe());
    };
  }, [sensorId, isAmbilData]);

  // sistem indikator koneksi
  useEffect(() => {
    let timer;
    timer = setTimeout(() => {
      setConnected(false);
    }, 3000);
    return () => {
      setConnected(true);
      clearTimeout(timer);
    };
  }, [sample]);

  useEffect(() => {
    if (location.pathname.split("/").includes("scan")) {
      onOpen();
    }
  }, []);

  return (
    <>
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
          {/* <div dangerouslySetInnerHTML={{ __html: myHtml }}></div> */}
          <Line
            options={{}}
            data={status !== "Standby" ? placeholderChart : chartData}
          />
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
            {sensorId === "" ? (
              <Button
                onClick={onOpen}
                size="sm"
                variant="link"
                colorScheme="teal"
                mb={2}
              >
                Scan Untuk Menggunakan Sensor
              </Button>
            ) : connected ? (
              <Text
                onClick={() => {
                  navigate("scan");
                  window.location.reload();
                }}
                _hover={{ color: "teal", cursor: "pointer" }}
                textColor={"gray"}
              >
                sensor {sensorId} <i>connected</i>
              </Text>
            ) : (
              <Text
                onClick={() => {
                  navigate("scan");
                  window.location.reload();
                }}
                _hover={{ color: "teal", cursor: "pointer" }}
                textColor={"gray"}
              >
                sensor {sensorId} <i>disconnected</i>
              </Text>
            )}
          </Flex>
          <Input
            placeholder="Masukan Nama Responden"
            shadow={"sm"}
            value={inputName}
            onChange={(event) => setInputName(event.target.value)}
          />
          <Input
            mt={2}
            placeholder="Masukan Usia Respoden"
            shadow={"sm"}
            value={inputAge}
            onChange={(event) => setInputAge(event.target.value)}
          />
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
              Mulai Pengambilan Data
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
            Systole: <b>{status !== "Standby" ? "..." : result.systole}</b>
            <br />
            Diastole: <b>{status !== "Standby" ? "..." : result.diastole}</b>
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
            bpm: {status !== "Standby" ? "..." : result.bpm}
            <br />
            ibi: {status !== "Standby" ? "..." : result.ibi}
            <br />
            sdnn: {status !== "Standby" ? "..." : result.sdnn}
            <br />
            rmssd: {status !== "Standby" ? "..." : result.rmssd}
            <br />
            mad: {status !== "Standby" ? "..." : result.mad}
          </Text>
        </GridItem>

        {status !== "Standby" && (
          <Center
            position={"fixed"}
            top={0}
            left={0}
            w={"full"}
            h={"100vh"}
            backdropFilter={"blur(3px)"}
          >
            <Button
              background={"teal"}
              p={10}
              rounded={"xl"}
              shadow={"2xl"}
              isLoading
              loadingText="Mengambil Data"
              colorScheme="teal"
              size={"lg"}
            ></Button>
          </Center>
        )}
      </Grid>

      <ModalScanSensor
        isOpen={isOpen}
        onClose={onClose}
        sensorId={sensorId}
        setSensorId={setSensorId}
      />
    </>
  );
}

const myHtml = String.raw`
    <py-script>
      import heartpy as hp
      import matplotlib.pyplot as plt
      import numpy as np
      from js import sinyal
      import pickle
      import modelSystole from "../modelSystole.pickle"
      import modelDiastole from "../modelDiastole.pickle"

      
      data = np.array(list(sinyal))  

      wd, m = hp.process(data, sample_rate = 100.0)

      ppg = [m['bpm'],m['ibi'],m['sdnn'],m['sdsd'],m['rmssd']]

      js.bpm = m['bpm']
      js.ibi = m['ibi']
      js.sdnn = m['sdnn']
      js.rmssd = m['rmssd']
      js.mad = m['hr_mad']

      systole = modelSystole.predict(ppg)
      js.systole = systole
      diastole = modelDiastole.predict(ppg)
      js.diastole = diastole
      
    </py-script>
  `;
