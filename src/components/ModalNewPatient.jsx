import { Box, Button, Center, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Image, Input, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, OrderedList, Select, Spacer, Table, TableCaption, TableContainer, Tbody, Td, Text, Tfoot, Th, Thead, Tr, useDisclosure, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"

export default function ModalNewPatient(props) {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [imageSrc, setImageSrc] = useState("")

  const handleTakePhoto = () => {
    if (!name || !gender || !age) {
      toast({
        description: "Please fill out the form",
        status: 'error',
      })
      return
    }
    onOpen()

  }

  const handleSubmit = async () => {
    if (!name || !gender || !age) {
      toast({
        description: "Please fill out the form",
        status: 'error',
      })
      return
    }

    console.log(imageSrc)

    await addDoc(doc(db, "patient"), {
      name: name,
      gender: gender,
      age: age,
      imageSrc: imageSrc,
      timestamp: serverTimestamp()
    });
    // TODO: kalau data sama jangan upload
  }

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };


  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Patient</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormLabel>Name:</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="" />
          <FormLabel mt={4}>Gender:</FormLabel>
          <Select placeholder='Select gender' value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <FormLabel mt={4}>Age</FormLabel>
          <NumberInput max={100} min={10}>
            <NumberInputField value={age} onChange={(e) => setAge(e.target.value)} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>

          <Button colorScheme='teal' mr={3} onClick={handleTakePhoto} w="full" mt={6}>
            Take Photo
          </Button>

        </ModalBody>
        <ModalFooter>

          {/* MODAL TAKE PHOTO */}
          <Modal isOpen={isOpen} onClose={onClose} size="3xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add New Patient</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Webcam
                  audio={false}
                  height={720}
                  screenshotFormat="image/jpeg"
                  width={1280}
                  videoConstraints={videoConstraints}
                >
                  {({ getScreenshot }) => (
                    <Flex w="full" justifyContent="space-between" mt={4} gap={4}>
                      <Button
                        colorScheme='teal'
                        onClick={() => setImageSrc(getScreenshot())}
                        w="full"
                      >
                        Capture
                      </Button>
                      <Button colorScheme='teal' onClick={handleSubmit} w="full">
                        Submit
                      </Button>
                    </Flex>
                  )}
                </Webcam>
              </ModalBody>
              <ModalFooter>
                <Image src={imageSrc} />
              </ModalFooter>
            </ModalContent>
          </Modal>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
