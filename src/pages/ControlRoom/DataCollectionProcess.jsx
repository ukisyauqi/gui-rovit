
import { Box, Button, Center, Flex, Grid, GridItem, Heading, Input, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, OrderedList, Spacer, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import bram from "../../assets/bram.png"

export default function DataCollectionProcess() {
 
  return (
    <Grid templateColumns={{ base: "", md: "auto 1fr" }} gap={{ sm: 3, md: 5, lg: 6 }} p={{ sm: 3, md: 5, lg: 6 }} minH='100vh'>

      {/* PATIENT DATA */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Center flexDirection="column" h="full">
          <Box rounded='full' w={48} h={48} bg={`gray`} bgRepeat="no-repeat" bgSize="cover"></Box>
          <Text fontSize="2xl" mt={4}>Bramantya Wilsa</Text>
          <Text mt={4}>
            Age: 25 <br />
            Gender: Male <br /><br />
            <b>Last MCU Data </b><br />
            Heart Rate: 100 <br />
            Oxigen Saturation: 100 <br />
            Body Temperature: 100 <br />
            Blood Pressure (sys/dia): 100 <br />
          </Text>
          <Spacer />
          <Button colorScheme='teal' w="full" mt={8}>Open Patient Data</Button>
        </Center>
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
            <Box h="50%" borderBottom="3px solid #E3EFF3">
              <Text fontWeight="semibold" fontSize="lg">Heart Rate</Text>
            </Box>

            {/* OS */}
            <Box h="50%" pt={3} borderBottom={{ base: "3px solid #E3EFF3", lg: "none" }}>
              <Text fontWeight="semibold" fontSize="lg">Oxygen Saturation</Text>
            </Box>
          </GridItem>

          {/* BT */}
          <GridItem pl={{ lg: 4 }} pt={{ base: 3, lg: 0 }}>
            <Box borderBottom="3px solid #E3EFF3" h="full">
              <Text fontWeight="semibold" fontSize="lg">Body Temperature</Text>
            </Box>
          </GridItem>

          {/* BPSYS */}
          <GridItem pl={{ lg: 4 }}>
            <Box borderBottom="3px solid #E3EFF3" h="full" pt={{ base: 3, lg: 2 }}>
              <Text fontWeight="semibold" fontSize="lg">Blood Pressure (SYS)</Text>
            </Box>
          </GridItem>

          {/* BPDIA */}
          <GridItem pl={{ lg: 4 }}>
            <Box h="full" pt={{ base: 3, lg: 2 }}>
              <Text fontWeight="semibold" fontSize="lg">Blood Pressure (DIA)</Text>
            </Box>
          </GridItem>

        </Grid>
      </GridItem>
    </Grid>
  )
}
