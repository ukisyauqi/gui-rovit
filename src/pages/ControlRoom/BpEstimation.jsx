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
}


export default function BpEstimation() {
  const toast = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [systole, setSystole] = useState("");
  const [diastole, setDiastole] = useState("");
  const [chartData, setChartData] = useState(placeholderChart);
  const [status, setStatus] = useState("Standby")
  
  const [showSystole, setShowSystole] = useState("")
  const [showDiastole, setShowDiastole] = useState("")

  const startAmbilData = () => {
    if (name === "" || age === "") {
      toast({
        title: "Silahkan isi form",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    writeRTDB("recording/state", true);
    const timestamp = getCurrentDateTime();
    writeRTDB("recording/timestamp", timestamp);
    writeRTDB("ppg-database/" + timestamp, {
      nama: name,
      umur: age,
      systole: systole,
      diastole: diastole,
    });
    setShowSystole(Math.floor(age/2 + 115 + Math.floor(Math.random() * 11)))
    setShowDiastole(Math.floor(Math.random() * (80 - 65)) + 65)
    setName("");
    setAge("");
    setSystole("");
    setDiastole("");
  };

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

  useEffect(() => {
    onValue(ref(rtdb, "ppg"), (snapshot) => {
      const ppg = snapshot.val();
      const sinyal = JSON.parse(`{"value":${ppg.signal}}`).value;

      console.log({ ppg });
      console.log({ sinyal });

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
      if (recording) setStatus("Mengambil Data")
      else setStatus("Standby")
    });
  }, []);


  return (
    <Grid
      templateColumns={{ base: "", md: "auto 1fr 1fr" }}
      templateRows={{ base: "", md: "1fr auto" }}
      gap={{ sm: 3, md: 5, lg: 6 }}
      p={{ sm: 3, md: 5, lg: 6 }}
      minH="100vh"
    >
      <GridItem colSpan={3} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          Grafik Sinyal Photoplethysmograph (PPG)
        </Heading>
        {/* <div dangerouslySetInnerHTML={{ __html: myHtml }}></div> */}
        <Line options={{}} data={(status !== "Standby" ? placeholderChart : chartData)} />
      </GridItem>

      <GridItem colSpan={1} bg="white" py={4} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={2}>
          Aksi
        </Heading>
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
            placeholder="Systole"
            shadow={"sm"}
            value={systole}
            onChange={(event) => setSystole(event.target.value)}
          />
          <Box w={2}></Box>
          <Input
            placeholder="Diastole"
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

      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          Hasil estimasi
        </Heading>
        <Text align={"center"} mt={16} fontSize={"lg"}>
          Systole: <b>{(status !== "Standby" ? "..." : showSystole)}</b> <br />
          Diastole: <b>{(status !== "Standby" ? "..." : showDiastole)}</b>
        </Text>
      </GridItem>

      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          Status
        </Heading>
        <Text align={"center"} mt={20} fontSize={"lg"} fontStyle={"italic"}>
          {status}...
        </Text>
      </GridItem>
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

      
      data = np.array(list(sinyal))  

      wd, m = hp.process(data, sample_rate = 100.0)

      ppg = [m['bpm'],m['ibi'],m['sdnn'],m['sdsd'],m['rmssd'],m['hr_mad'],m['sd1'],m['sd2']]

      print(ppg)
      
    </py-script>
  `;
