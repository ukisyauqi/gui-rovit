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
import { onValue, ref } from "firebase/database";
import { rtdb, writeRTDB } from "../firebase";
import { RiDeleteBin6Line } from "react-icons/ri";
import { TbActivityHeartbeat } from "react-icons/tb ";
import { AiOutlineSearch } from "react-icons/ai";
import { CSVLink, CSVDownload } from "react-csv";
import { Line } from "react-chartjs-2";

export default function Item({timestamp, value}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Tr key={timestamp}>
      <Td textAlign="center">{value.nama ?? " - "}</Td>
      <Td textAlign="center">{value.umur ?? " - "}</Td>
      <Td textAlign="center">{value.weight ?? " - "}</Td>
      <Td textAlign="center">{value.temperature ?? " - "}</Td>
      <Td textAlign="center">
        {value.inputSystole ?? " - "}/
        {value.inputDiastole ?? " - "}
      </Td>
      <Td textAlign="center">
        {value.systole ?? " - "}/{value.diastole ?? " - "}
      </Td>
      <Td textAlign="center">{value.bpm ?? " - "}</Td>
      <Td textAlign="center">{value.ibi ?? " - "}</Td>
      <Td textAlign="center">{value.sdnn ?? " - "}</Td>
      <Td textAlign="center">{value.rmssd ?? " - "}</Td>
      <Td textAlign="center">{value.mad ?? " - "}</Td>

      <Td>
        <Flex alignItems="center">
          <Text>{timestamp ?? " - "}</Text>
          <Spacer />
          <Popover>
            <PopoverTrigger>
              <Button
                variant="ghost"
                rounded="full"
                size="sm"
                my="-1"
              >
                ⋮
              </Button>
            </PopoverTrigger>
            <PopoverContent mr={6} w="fit-content">
              <PopoverBody>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => writeRTDB("data/" + timestamp, null)}
                >
                  <RiDeleteBin6Line />
                  &nbsp; Delete Data
                </Button>
                <br />
                <Button
                  size="sm"
                  colorScheme="teal"
                  variant="ghost"
                  onClick={onOpen}
                >
                  <TbActivityHeartbeat />
                  &nbsp; See PPG Signal
                </Button>

                <Modal isOpen={isOpen} onClose={onClose} size={"5xl"}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>
                      Sinyal PPG {value.nama}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      {value.sinyal && (
                      <Line
                        options={{ animation: false }}
                        data={{
                          labels: [],
                          datasets: [
                            {
                              label: "PPG signal",
                              data: value.sinyal.reduce(
                                (acc, value, index) => {
                                  acc[index] = value;
                                  return acc;
                                },
                                {}
                              ),
                              borderWidth: 2,
                              borderColor: "rgb(255, 99, 132)",
                              backgroundColor:
                                "rgba(255, 99, 132, 0.5)",
                              pointRadius: 1,
                            },
                          ],
                        }}
                      />
                    )}
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      </Td>
    </Tr>
  );
}