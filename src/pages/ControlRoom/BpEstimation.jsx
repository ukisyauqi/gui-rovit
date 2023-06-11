import React from "react";
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
import { writeRTDB, rtdb } from "../../firebase";
import { onValue, ref } from "firebase/database";

export default function BpEstimation() {
  const toast = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [systole, setSystole] = useState("");
  const [diastole, setDiastole] = useState("");
  const [PPG, setPPG] = useState({});

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
      setPPG(snapshot.val());
    });
  }, []);

  useEffect(() => {
    if (PPG !== undefined) {
      try {
        const sinyal = JSON.parse(`{"name":${PPG.signal}}`);
        console.log(sinyal);
      } catch (error) {
        console.log(error);
      }
    }
  }, [PPG]);

  const myHtml = `
    <py-script>
      import heartpy as hp
      import matplotlib.pyplot as plt

      print('Hello, World!')
      data, timer = hp.load_exampledata(0)
      
      print(js)
    </py-script>
  `;

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
        <div dangerouslySetInnerHTML={{ __html: myHtml }}></div>
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
        <Text align={"center"} mt={10} fontSize={"lg"}>
          Systole: <b>80</b> <br />
          Diastole: <b>100</b>
        </Text>
      </GridItem>

      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>
          Status
        </Heading>
        <Text align={"center"} mt={12} fontSize={"lg"} fontStyle={"italic"}>
          mengambil data...
        </Text>
      </GridItem>
    </Grid>
  );
}
