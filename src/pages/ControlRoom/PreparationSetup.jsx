import { Box, Button, flattenTokens, Flex, Grid, GridItem, Heading, HStack, Input, ListItem, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, OrderedList, Spacer, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { writeRTDB } from "../../firebase";

export default function PreparationSetup() {
  const roomList = ["A", "B", "C", "D"]
  const [selectedRooms, setSelectedRooms] = useState([])
  const [upperItem, setUpperItem] = useState("")
  const [middleItem, setMiddleItem] = useState("")
  const [lowerItem, setLowerItem] = useState("")
  const { isOpen, onOpen, onClose } = useDisclosure()

  const openLowerHold = () => {
    writeRTDB("open", true)
    writeRTDB("close", false)
  }

  const closeLowerHold = () => {
    writeRTDB("open", false)
    writeRTDB("close", true)
  }

  const release = () => {
    writeRTDB("open", false)
    writeRTDB("close", false)
  }


  return (
    <Grid templateRows={{ base: "", md: "1fr auto" }} templateColumns={{ base: "", md: "repeat(3, 1fr)" }} gap={{ sm: 3, md: 5, lg: 6 }} p={{ sm: 3, md: 5, lg: 6 }} minH='100vh'>

      {/* MAP */}
      <GridItem rowSpan={2} colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Heading fontSize="xl" fontWeight="semibold">Map / Robot Position</Heading>
      </GridItem>

      {/* SET DESTIANTION ROOM */}
      <GridItem colSpan={1} py={5} px={6} bg="white" rounded="md" shadow="md">
        <Flex direction='column' h="full">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>Set Destination Room</Heading>
          <OrderedList>
            {selectedRooms.map((room, i) => <ListItem key={i}>Room: {room}</ListItem>)}
          </OrderedList>
          <Spacer />
          <Flex justifyContent="space-around">

            {/* BUTTON ADD ROOM */}
            <Menu>
              <MenuButton as={Button} size="sm" colorScheme="teal">Add Room</MenuButton>
              <MenuList p={0}>
                {roomList.map((room, i) => <>
                  <MenuItem p={0} key={i}>
                    <Button onClick={() => setSelectedRooms((prev) => [...prev, roomList[i]])} variant="unstyled" w="100%" justifyContent="flex-start">
                      <Text textAlign="left" px={4}>
                        Room {room}
                      </Text>
                    </Button>
                  </MenuItem>
                </>)}
              </MenuList>
            </Menu>

            {/* BUTTON RESET ROOM */}
            <Button size="sm" colorScheme="teal" onClick={() => setSelectedRooms([])}>Reset Room</Button>

          </Flex>
        </Flex>
      </GridItem>

      {/* SET DRAWER ITEMS */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md" position='relative'>
        <Flex h="full" direction="column">

          <Heading fontSize="xl" fontWeight="semibold" mb={3}>Set Drawer Items</Heading>
          <Text>Upper: {upperItem || "empty"}</Text>
          <Text>Middle: {middleItem || "empty"}</Text>
          <Text>Lower: {lowerItem || "empty"}</Text>
          <Spacer />
          <Flex justifyContent="space-around">

            {/* BUTTON ADD ITEMS */}
            <Button onClick={onOpen} colorScheme="teal" size="sm">Add Items</Button>

            {/* MODAL ADD ITEMS */}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Add Drawer Items</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Upper Drawer Items:</Text>
                  <Input value={upperItem} onChange={(e) => setUpperItem(e.target.value)} />
                  <Text mt={4}>Middle Drawer Items:</Text>
                  <Input value={middleItem} onChange={(e) => setMiddleItem(e.target.value)} />
                  <Text mt={4}>Lower Drawer Items:</Text>
                  <Input value={lowerItem} onChange={(e) => setLowerItem(e.target.value)} />
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme='blue' mr={3} onClick={onClose}>
                    Confirm
                  </Button>
                  <Button variant='ghost' onClick={() => {
                    setUpperItem("")
                    setMiddleItem()
                  }}>Cancel</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* BUTTON RESET ITEMS */}
            <Button size="sm" colorScheme="teal" onClick={() => {
              setUpperItem("")
              setMiddleItem("")
              setLowerItem("")
            }}>Reset Items</Button>

          </Flex>
        </Flex>
      </GridItem>

      {/* AUTOMATION */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Flex h="full" direction="column">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>Automation</Heading>
          <Spacer />
          <Button size='lg' mt={4} colorScheme='teal'>Start Robot Automation</Button>
          <Button size='lg' mt={4} colorScheme='red'>Stop Robot Automation</Button>
        </Flex>
      </GridItem>

      {/* OPEN DRAWER */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Flex h="full" direction="column">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>Open Drawer</Heading>
          <Spacer />
          <Button mt={4} colorScheme='teal'>Open Upper Drawer</Button>
          <Button mt={4} colorScheme='teal'>Open Middle Drawer</Button>
          <HStack mt={4}>
            <Button colorScheme='teal' onMouseDown={openLowerHold} onMouseUp={release}>Open Lower Drawer</Button>
            <Button colorScheme='teal' onMouseDown={closeLowerHold} onMouseUp={release}>Close Lower Drawer</Button>
          </HStack>

        </Flex>
      </GridItem>

    </Grid>
  );
}
