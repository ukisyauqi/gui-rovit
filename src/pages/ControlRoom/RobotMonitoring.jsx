import { Box, Button, Center, Flex, Grid, GridItem, Heading, Image, Input, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, OrderedList, Spacer, Table, TableContainer, Tbody, Td, Text, Tr, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Webcam from "react-webcam";


export default function RobotMonitoring() {
  return (
    <Grid templateRows={{ base: "", md: "1fr auto auto" }} templateColumns={{ base: "", md: "repeat(3, 1fr)" }} gap={{ sm: 3, md: 5, lg: 6 }} p={{ sm: 3, md: 5, lg: 6 }} minH='100vh'>

      {/* MAP */}
      <GridItem rowSpan={{ base: 1, lg: 2 }} colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={3}>Map / Robot Position</Heading>
        <Center>
          <Image src="https://iili.io/HnnuQGp.png" w="180px" />
        </Center>
      </GridItem>

      {/* CAM */}
      <GridItem rowSpan={1} colSpan={{ base: 1, lg: 2 }} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={3}>CAM</Heading>
        <Webcam
          audio={false}
          height={620}
          width={1280}
          videoConstraints={{
            width: 1280,
            height: 610,
            facingMode: "user"
          }}
        >

        </Webcam>
      </GridItem>

      {/* DRAWER ITEMS */}
      <GridItem rowSpan={1} colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={3}>Drawer Items</Heading>
        <Text>Upper: Sop</Text>
        <Text>Middle: Susu</Text>
        <Text>Lower: Paracetamol</Text>
      </GridItem>

      {/* ROBOT STATUS */}
      <GridItem rowSpan={{ base: 1, lg: 2 }} colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={3}>Robot Status</Heading>
        <Flex>
          <Box>
            <Text>Lidar System</Text>
            <Text>Motor Speed</Text>
            <Text>Object Disturbance</Text>
            <Text>Biosignal System</Text>
            <Text>Battery</Text>
            <Text>Internet Connection</Text>
          </Box>
          <Spacer />
          <Box>
            <Text>Ready</Text>
            <Text>5 m/s</Text>
            <Text>3</Text>
            <Text>Ready</Text>
            <Text>80%</Text>
            <Text>100 Mbps</Text>
          </Box>
        </Flex>
      </GridItem>

      {/* DESTINATION ROOM */}
      <GridItem rowSpan={1} colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={3}>Destination Room:</Heading>
        <Text>Room A -&gt; Room B -&gt; Room C</Text>
      </GridItem>

      {/* ONGOING PROCESS */}
      <GridItem rowSpan={1} colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold" mb={3}>Ongoing Process</Heading>
        <Text>Medical Check Up...</Text>
      </GridItem>
    </Grid>
  )
}
