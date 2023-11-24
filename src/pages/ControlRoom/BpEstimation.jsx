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
  const timestamp = useRef(null);
  const btnRefEstimateBpStart = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [suhu, setSuhu] = useState(0);

  // helper functions
  function getCurrentDateTime() {
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

  // main functions
  const startAmbilData = () => {
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
    writeRTDB(sensorId + "/isRecording", true);
    timestamp.current = getCurrentDateTime();
  };

  const estimateBPFinish = () => {
    const estimatedSystole = document.getElementById("systole").innerHTML;
    const estimatedDiastole = document.getElementById("diastole").innerHTML;
    const ppgFeature = JSON.parse(document.getElementById("ppg").innerHTML);

    writeRTDB("data/" + timestamp.current, {
      nama: inputName,
      umur: inputAge,
      inputSystole: inputSystole,
      inputDiastole: inputDiastole,
      sensorId: sensorId,
      sinyal: window.sinyal,
      estimatedSystole: estimatedSystole,
      estimatedDiastole: estimatedDiastole,
      ppgFeature: ppgFeature,
    });

    setResult({
      systole: Math.round(estimatedSystole),
      diastole: Math.round(estimatedDiastole),
      bpm: Math.round(ppgFeature[0]),
      ibi: Math.round(ppgFeature[1]),
      sdnn: Math.round(ppgFeature[2]),
      rmssd: Math.round(ppgFeature[3]),
      mad: Math.round(ppgFeature[4]),
    });

    const text = `pengukuran selesai, tekanan darah kamu, ${Math.round(
      estimatedSystole
    )} per ${Math.round(estimatedDiastole)}, dengan suhu tubuh 
      ${suhu}
     derajat selsius`;
    speak({ text: text, voice: voices[3] });

    // setInputName("");
    // setInputAge("");
    // setInputSystole("");
    // setInputDiastole("");
  };

  // USE EFFECTS
  useEffect(() => {
    if (sensorId === "") return;

    const unsubscribes = [];
    unsubscribes.push(
      onValue(ref(rtdb, sensorId + "/isRecording"), (snapshot) => {
        if (snapshot.val()) {
          setIsAmbilData(true);
        } else {
          if (isAmbilData) {
            setIsAmbilData(false);
          }
        }
      })
    );

    unsubscribes.push(
      onValue(ref(rtdb, sensorId + "/signal"), (snapshot) => {
        // we get sinyal at first mount
        // and if sinyal baru dari sensor
        let sinyal = snapshot.val();
        if (typeof sinyal === "string") {
          sinyal = JSON.parse(`{"value":${snapshot.val()}}`).value;
        }
        window.sinyal = sinyal;
        if (sinyal) {
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
          if (timestamp.current && !isAmbilData) {
            console.log("estimate BP Start");
            btnRefEstimateBpStart.current.click();
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
      onValue(ref(rtdb, sensorId + "/suhu"), (snapshot) => {
        const data = snapshot.val();
        setSuhu(data.toFixed(2));
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
    if (sensorId == "") setSensorId(sessionStorage.getItem("sensorId") ?? "");
  }, []);

  return (
    <>
      <div style={{ display: "none" }}>
        <div dangerouslySetInnerHTML={{ __html: myHtml }}></div>
        <button id="estimateBPStart" ref={btnRefEstimateBpStart}></button>
        <button id="estimateBPFinish" onClick={estimateBPFinish}></button>
        <p id="ppg"></p>
        <p id="systole"></p>
        <p id="diastole"></p>
      </div>

      <Center
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
      </Center>

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
          <Line
            options={{}}
            data={isAmbilData ? placeholderChart : chartData}
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
                  onOpen();
                }}
                _hover={{ color: "teal", cursor: "pointer" }}
                textColor={"gray"}
              >
                sensor {sensorId} <i>connected</i>
              </Text>
            ) : (
              <Text
                onClick={() => {
                  onOpen();
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
            Systole: <b>{isAmbilData ? "..." : result?.systole}</b>
            <br />
            Diastole: <b>{isAmbilData ? "..." : result?.diastole}</b>
            <br />
            {isAmbilData ? "..." : suhu ? "Suhu: " + suhu : ""}
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
            bpm: {isAmbilData ? "..." : result?.bpm}
            <br />
            ibi: {isAmbilData ? "..." : result?.ibi}
            <br />
            sdnn: {isAmbilData ? "..." : result?.sdnn}
            <br />
            rmssd: {isAmbilData ? "..." : result?.rmssd}
            <br />
            mad: {isAmbilData ? "..." : result?.mad}
          </Text>
        </GridItem>

        {isAmbilData && (
          <Center
            position={"fixed"}
            top={0}
            left={0}
            w={"full"}
            h={"100vh"}
            backdropFilter={"blur(3px)"}
            zIndex={100}
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
from pyscript import window, document
import pickle

with open(f"modelDiastole.pickle", "rb") as file:
  modelDiastole = pickle.load(file)

with open(f"modelSystole.pickle", "rb") as file:
  modelSystole = pickle.load(file)

def estimateBPStart(event):
  print("bp estimation python start")
  ppg_feature = []

  sinyal = window.sinyal

  try:
    wd, m = hp.process(np.array(sinyal), sample_rate = 100)
  except :
    window.alert("Sinyal Buruk")
    return
  
  for measure in m.keys():
    try:
      ppg_feature[0].append(m[measure])
    except:
      ppg_feature.append([])
      ppg_feature[0].append(m[measure])

  
  document.getElementById("ppg").innerHTML = ppg_feature[0] 
  document.getElementById("systole").innerHTML = modelSystole.predict(ppg_feature)[0]
  document.getElementById("diastole").innerHTML = modelDiastole.predict(ppg_feature)[0]
  document.getElementById("estimateBPFinish").click()

document.getElementById("estimateBPStart").onclick = estimateBPStart

document.getElementById("preparingEnvironment").style.display = "none"

</py-script>
  `;
