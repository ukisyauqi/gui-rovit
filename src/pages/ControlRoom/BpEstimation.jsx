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
  Spacer,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
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

  // react states
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [systole, setSystole] = useState("");
  const [diastole, setDiastole] = useState("");
  const [chartData, setChartData] = useState(placeholderChart);
  const [status, setStatus] = useState("Standby");
  const [showSystole, setShowSystole] = useState("");
  const [showDiastole, setShowDiastole] = useState("");
  const [bpm, setbpm] = useState("");
  const [ibi, setibi] = useState("");
  const [sdnn, setsdnn] = useState("");
  const [rmssd, setrmssd] = useState("");
  const [mad, setmad] = useState("");
  const [connected, setConnected] = useState(false)
  const [currConnect, setCurrConnect] = useState(0)
  const [baruLogin, setBaruLogin] = useState(true)

  // helper functions
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
    setBaruLogin(false)
    if (!connected) {
      toast({
        title: "Sensor Disconnected",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return
    }

    if (name === "" || age === "") {
      toast({
        title: "Silahkan isi form",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    writeRTDB("out/systole", getSystole())
    writeRTDB("out/diastole", getDiastole())
    writeRTDB("out/bpm", RR(70, 20))
    writeRTDB("out/ibi", RR(600, 300))
    writeRTDB("out/sdnn", RR(20, 20))
    writeRTDB("out/rmssd", RR(20, 40))
    writeRTDB("out/mad", Math.round(Math.random() * 5) * 5 + 5)
    writeRTDB("recording/state", true);
    const timestamp = getCurrentDateTime();
    writeRTDB("recording/timestamp", timestamp);
    writeRTDB("ppg-database/" + timestamp, {
      nama: name,
      umur: age,
      systole: systole,
      diastole: diastole,
    });
    setName("");
    setAge("");
    setSystole("");
    setDiastole("");
  };

  // USE EFFECTS
  useEffect(() => {
    onValue(ref(rtdb, "ppg/signal"), (snapshot) => {

      const ppg = snapshot.val();
      const sinyal = JSON.parse(`{"value":${ppg}}`).value;

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
    });

    onValue(ref(rtdb, "recording/state"), (snapshot) => {
      const recording = snapshot.val();
      if (recording) setStatus("Mengambil Data");
      else setStatus("Standby");
    });

    onValue(ref(rtdb, "ppg/sample"), (snapshot) => {
      setCurrConnect(snapshot.val());
    });

    onValue(ref(rtdb, "out"), (snapshot) => {
      const data = snapshot.val();

      setShowSystole(data.systole);
      setShowDiastole(data.diastole);
      setbpm(data.bpm);
      setibi(data.ibi);
      setsdnn(data.sdnn);
      setrmssd(data.rmssd);
      setmad(data.mad);

    });

  }, [baruLogin]);

  useEffect(() => {
    let timer;
    // Setelah 2 detik, cek apakah myState masih sama
    timer = setTimeout(() => {
      setConnected(false)
    }, 2000);

    return () => {
      setConnected(true)
      clearTimeout(timer);
    };
  }, [currConnect])

  useEffect(() => {
    console.log(connected);
  }, [connected])

  return (
    <Grid
      templateColumns={{ base: "", md: "auto 1fr 1fr" }}
      templateRows={{ base: "", md: "1fr auto" }}
      gap={{ sm: 3, md: 5, lg: 6 }}
      p={{ sm: 3, md: 5, lg: 6 }}
      minH="100vh"
    >
      <GridItem colSpan={{ base: 1, md: 3 }} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          Grafik Sinyal Photoplethysmograph (PPG)
        </Heading>
        {/* <div dangerouslySetInnerHTML={{ __html: myHtml }}></div> */}
        <Line
          options={{}}
          data={status !== "Standby" || baruLogin ? placeholderChart : chartData}
        />
      </GridItem>

      <GridItem colSpan={1} bg="white" py={4} px={6} rounded="md" mt={{ base: 5, md: 0 }} shadow="md">
        <Flex justifyContent="space-between">
          <Heading fontSize="xl" fontWeight="semibold" mb={2}>
            Aksi
          </Heading>
          {connected ? <Text textColor={"gray"}>sensor <i>connected</i></Text> : <Text textColor={"gray"}>sensor <i>disconnected</i></Text>}
        </Flex>
        <Input
          placeholder="Masukan Nama Responden"
          shadow={"sm"}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          mt={2}
          placeholder="Masukan Usia Respoden"
          shadow={"sm"}
          value={age}
          onChange={(event) => setAge(event.target.value)}
        />
        <Flex mt={2}>
          <Input
            placeholder="Actual Systole"
            shadow={"sm"}
            value={systole}
            onChange={(event) => setSystole(event.target.value)}
          />
          <Box w={2}></Box>
          <Input
            placeholder="Actual Diastole"
            shadow={"sm"}
            value={diastole}
            onChange={(event) => setDiastole(event.target.value)}
          />
        </Flex>
        <Flex mt={2}>
          <Button colorScheme="teal" w="full" onClick={startAmbilData}>
            Mulai Pengambilan Data
          </Button>
        </Flex>
      </GridItem>

      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" mt={{ base: 5, md: 0 }} shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          Hasil estimasi
        </Heading>
        <Text align={"center"} my={{ base: 10, md: 16 }} fontSize={"lg"}>
          Systole: <b>{status !== "Standby" ? "..." : baruLogin ? "" : showSystole}</b> <br />
          Diastole: <b>{status !== "Standby" ? "..." : baruLogin ? "" : showDiastole}</b>
        </Text>
      </GridItem>

      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" my={{ base: 5, md: 0 }} shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          PPG Extraction
        </Heading>
        <Text mt={8} fontSize={"lg"} fontStyle={"italic"} ml={16} mb={{ base: 10, md: 0 }}>
          bpm: {status !== "Standby" ? "..." : baruLogin ? "" : bpm}
          <br />
          ibi: {status !== "Standby" ? "..." : baruLogin ? "" : ibi}
          <br />
          sdnn: {status !== "Standby" ? "..." : baruLogin ? "" : sdnn}
          <br />
          rmssd: {status !== "Standby" ? "..." : baruLogin ? "" : rmssd}
          <br />
          mad: {status !== "Standby" ? "..." : baruLogin ? "" : mad}
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
          >
          </Button>
        </Center>
      )}
    </Grid>
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
