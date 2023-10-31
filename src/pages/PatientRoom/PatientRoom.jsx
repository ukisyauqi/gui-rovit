import { Center, Box, Button, Flex, Grid, GridItem, Heading, Input, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, OrderedList, Spacer, Text, useDisclosure } from "@chakra-ui/react";
import { useLayoutEffect } from "react";
import { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"

export default function PatientRoom() {
  const [hr, setHr] = useState([])
  const [os, setOs] = useState([])
  const [temp, setTemp] = useState([])

  // let conn

  // const handleClick = () => {
  //   conn.send('start-mcu', "aasda");
  // }

  // useEffect(() => {
  //   conn = connect({
  //     baudRate: 9600
  //   })

  //   conn.on('temp', function (data) {
  //     console.log(data)
  //     setTemp((prev) => [data, ...prev])
  //   });

  //   conn.on('hr', function (data) {
  //     console.log(data)
  //     setHr((prev) => [data, ...prev])
  //   });

  //   conn.on('o2', function (data) {
  //     console.log(data)
  //     setOs((prev) => [data, ...prev])
  //   });

  //   return () => {
  //     conn.removeModal()
  //     conn.removeListeners("temp")
  //     conn.removeListeners("hr")
  //     conn.removeListeners("o2")
  //   }
  // }, [])

  // useEffect(() => {
  //   if (hr.length > 100) {
  //     addDoc(doc(db, "mcu"), {
  //       hr: hr,
  //       os: os,
  //       temp: temp,
  //       uid: "asdasdasd",
  //       timestamp: serverTimestamp()
  //     });
  //     alert("oaksdoa")
  //   }
  
  //   return () => {
      
  //   }
  // }, [hr])
  


  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <Grid
      templateColumns={{ base: "", md: "1fr 1fr" }}
      templateRows={{ base: "", md: "auto 1fr" }}
      gap={{ sm: 3, md: 5, lg: 6 }}
      p={{ sm: 3, md: 5, lg: 6 }}
      minH='100vh'
      bg="linear-gradient(135deg, rgba(235,244,244,1) 0%, rgba(224,237,243,1) 50%, rgba(224,243,233,1) 100%);"
    >
      <GridItem colSpan={2} rowSpan={1} bg="white" rounded="3xl" shadow="md" overflow="hidden">
        <Flex h="full" alignContent="center">
          <Text color="white" fontWeight="semibold" fontSize="lg" textAlign="center" py="1.25rem" px={6} borderRight="1px solid gainsboro" h="full" bg="teal.400">Interactive<br />Command</Text>
          <Text w="full" m={6} textAlign="center" verticalAlign="center" fontWeight="semibold" fontSize="3xl">Silahkan tempatkan dahi pada sensor</Text>
        </Flex>
      </GridItem>
      {/* MEDICAL CHECKUP */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>Medical Check up</Heading>
        <Grid
          h={{ base: "80em", lg: "calc(100% - 2.5em)" }}
          rounded="xl"
          templateRows={{ lg: "repeat(3, 1fr)" }}
          templateColumns={{ lg: "repeat(2, 1fr)" }}
          p={{ base: 3, lg: 4 }}
          border="3px solid #E3EFF3"
        >

          <GridItem rowSpan={3} borderRight={{ lg: "3px solid #E3EFF3" }} pr={{ lg: 4 }}>
            {/* HR */}
            <Box borderBottom="3px solid #E3EFF3">
              <Text>Heart Rate</Text>
              <Box overflow="auto" h="10.75rem">
                {hr.map((el) => <>
                  <Text>{el}</Text>
                </>)}
              </Box>
            </Box>

            {/* OS */}
            <Box pt={3} borderBottom={{ base: "3px solid #E3EFF3", lg: "none" }}>
              <Text >Oxygen Saturation</Text>
              <Box h="10.75rem" overflow="auto">
                {os.map((el) => <>
                  <Text>{el}</Text>
                </>)}
              </Box>
            </Box>
          </GridItem>

          {/* BT */}
          <GridItem pl={{ lg: 4 }} pt={{ base: 3, lg: 0 }} >
            <Box borderBottom="3px solid #E3EFF3">
              <Text >Body Temperature</Text>
              <Box overflow="auto" h="6.75rem">
                {temp.map((el) => <>
                  <Text>{el}</Text>
                </>)}
              </Box>
            </Box>
          </GridItem>

          {/* BPSYS */}
          <GridItem pl={{ lg: 4 }}>
            <Box borderBottom="3px solid #E3EFF3" h="8.5rem" pt={{ base: 3, lg: 2 }}>
              <Text >Blood Pressure (SYS)</Text>
            </Box>
          </GridItem>

          {/* BPDIA */}
          <GridItem pl={{ lg: 4 }} h="8.25rem">
            <Box h="full" pt={{ base: 3, lg: 2 }}>
              <Text >Blood Pressure (DIA)</Text>
            </Box>
          </GridItem>

        </Grid>
      </GridItem>


      <GridItem bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={4}>CAM</Heading>
        <Webcam
          audio={false}
          height={720}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={videoConstraints}
        >
          {({ getScreenshot }) => (
            <Flex w="full" justifyContent="space-between" mt={4} gap={4}>
              {/* <Button
                colorScheme='teal'
                // onClick={() => setImageSrc(getScreenshot())}
                w="full"
              >
                Capture
              </Button>
              <Button colorScheme='teal' w="full">
                Submit
              </Button> */}
            </Flex>
          )}
        </Webcam>
        <Flex w="full" justifyContent="space-between">
          <Box>
            <Text>Nama: Bramantya Wilsa</Text>
            <Text>Umur: 30</Text>
            <Text>Jenis-Kelamin: laki-laki</Text>
          </Box>
          <Center p={4}>
            <Button colorScheme="teal">Panggil Dokter</Button>
          </Center>

        </Flex>
      </GridItem>
    </Grid>
  )
}
