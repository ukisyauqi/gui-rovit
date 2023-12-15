import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
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
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import ModalNewPatient from "../../components/ModalNewPatient";
import { onValue, ref } from "firebase/database";
import { rtdb, writeRTDB } from "../../firebase";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbActivityHeartbeat } from "react-icons/tb ";
import { AiOutlineSearch } from "react-icons/ai";
import { CSVLink, CSVDownload } from "react-csv";
import { Line } from "react-chartjs-2";
import Item from "../../components/Item";

export default function PatientsData() {
  const [filteredData, setFilteredData] = useState([]);
  const data = useRef([]);

  const search = (e) => {
    e.preventDefault();
    const query = e.target.elements.query.value;
    setFilteredData(
      data.current.filter((el) => {
        if (el[0].includes(query)) return true;
        for (const [key, value] of Object.entries(el[1])) {
          if (key === "ppg") continue;
          if (value.toString().includes(query)) return true;
        }
        return false;
      })
    );
  };

  const headers = [
    { label: "name", key: "nama" },
    { label: "age", key: "umur" },
    { label: "weight", key: "weight" },
    { label: "temperature", key: "temperature" },
    { label: "actual_systole", key: "inputSystole" },
    { label: "actual_diastole", key: "inputDiastole" },
    { label: "estimated_systole", key: "systole" },
    { label: "estimated_diastole", key: "diastole" },
    { label: "bpm", key: "bpm" },
    { label: "ibi", key: "ibi" },
    { label: "sdnn", key: "sdnn" },
    { label: "rmssd", key: "rmssd" },
    { label: "hr_mad", key: "mad" },
    { label: "ppg", key: "sinyal" },
    { label: "timestamp", key: "timestamp" },
  ];
  useEffect(() => {
    const unsub = onValue(ref(rtdb, "data"), (snapshot) => {
      data.current = Object.entries(snapshot.val()).reverse();
      setFilteredData(data.current);

      console.log(data.current);
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <Grid
      templateColumns={{ base: "", md: "" }}
      gap={{ sm: 3, md: 5, lg: 6 }}
      p={{ sm: 3, md: 5, lg: 6 }}
      h={{ lg: "100vh" }}
      overflowX={"scroll"}
    >
      {/* PATIENT DATA */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Box overflow="auto" h="77vh">
          <Flex>
            <Heading fontSize={"xl"} fontWeight={"semibold"}>
              Patients Data
            </Heading>
            <Spacer />
            <form onSubmit={search}>
              <InputGroup w={"fit-content"}>
                <InputLeftElement>
                  <Button
                    type="submit"
                    _hover={{ background: "gray.50" }}
                    variant="ghost"
                    p="0"
                    rounded="full"
                    size="sm"
                  >
                    <AiOutlineSearch style={{ color: "lightgray" }} />
                  </Button>
                </InputLeftElement>
                <Input type="text" placeholder="Search Data" name="query" />
              </InputGroup>
            </form>
            <CSVLink
              data={filteredData.map((el) => {
                return { timestamp: el[0], ...el[1] };
              })}
              headers={headers}
            >
              <Button ml={3} colorScheme="teal">
                Export CSV
              </Button>
            </CSVLink>
          </Flex>
          <TableContainer mt={4}>
            <Table size="sm" border="1px solid" borderColor="gray.100">
              <Thead>
                <Tr>
                  <Th textAlign="center">Nama</Th>
                  <Th textAlign="center">Umur</Th>
                  <Th textAlign="center">Berat Badan</Th>
                  <Th textAlign="center">Suhu</Th>
                  <Th textAlign="center">Actual SYS/DIA</Th>
                  <Th textAlign="center">Estimated SYS/DIA</Th>
                  <Th textAlign="center">BPM</Th>
                  <Th textAlign="center">IBI</Th>
                  <Th textAlign="center">SDNN</Th>
                  <Th textAlign="center">RMSSD</Th>
                  <Th textAlign="center">MAD</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map(([key, value]) => <Item key={key} timestamp={key} value={value}/>)}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </GridItem>
    </Grid>
  );
}
