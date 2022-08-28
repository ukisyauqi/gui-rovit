import { Box, Button, Center, Flex, Grid, GridItem, Heading, Input, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, OrderedList, Spacer, Table, TableCaption, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function PatientsData() {
  const [data, setData] = useState([])

  const getData = () => {
    const data = {
      hr: 100,
      os: 100,
      bt: 100,
      bpsys: 100,
      bpdia: 100,
      timestamp: "12/12/12 - 12:12"
    }
    const res = []
    for (let i = 0; i < 20; i++) {
      res.push(data)
    }
    return res
  }

  useEffect(() => {
    setData(getData())
  
    return () => {
    }
  }, [])
  
  
  return (
    <Grid templateColumns={{ base: "", md: "auto 1fr" }} gap={{ sm: 3, md: 5, lg: 6 }} p={{ sm: 3, md: 5, lg: 6 }} h={{base: "100vh"}}>
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold">Patient List</Heading>
        <OrderedList mt={4} spacing={1} minW={36} pl={1}>
          <ListItem>Bramantya Wilsa</ListItem>
          <ListItem>M. Syauqi F</ListItem>
          <ListItem>M. Bayu S</ListItem>
          <ListItem>Rafly</ListItem>
          <ListItem>Zulfan Zauhar</ListItem>
          <ListItem>Treza Daffa</ListItem>npm 
          <ListItem>Wildan</ListItem>
          <ListItem>Rezqia</ListItem>
          <ListItem>Wafi Nur</ListItem>
          <ListItem>Irfan Kamal</ListItem>
          <ListItem>Angga Wira</ListItem>
          <ListItem>Bagas Satrio</ListItem>
          <ListItem>Baginta Raja</ListItem>
        </OrderedList>

        <Button colorScheme="teal">Add New Patient</Button>
      </GridItem>
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md" overflow="auto">
        <Heading fontSize="xl" fontWeight="semibold">Patient Data</Heading>

        <Flex w="full" justifyContent="space-around" mt={4}>
          <Text>Name: Bramantya Wilsa</Text>
          <Text>Age: 40</Text>
          <Text>Gender: Male</Text>
        </Flex>
        <TableContainer mt={4}>
          <Table size="sm" border="1px solid" borderColor="gray.100">
            <Thead>
              <Tr>
                <Th>HR</Th>
                <Th>OS</Th>
                <Th>BT</Th>
                <Th>BP (SYS)</Th>
                <Th>BP (DIA)</Th>
                <Th>Timestamp</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((d) => <Tr>
                <Td>{d.hr}</Td>
                <Td>{d.os}</Td>
                <Td>{d.bt}</Td>
                <Td>{d.bpsys}</Td>
                <Td>{d.bpdia}</Td>
                <Td>{d.timestamp}</Td>
              </Tr>)}
            </Tbody>
          </Table>
        </TableContainer>
      </GridItem>

    </Grid>

  )
}
