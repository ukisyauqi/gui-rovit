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
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { writeRTDB } from "../../firebase";

export default function PreparationSetup() {
  const roomList = ["A", "B", "C", "D"];
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [upperItem, setUpperItem] = useState("");
  const [middleItem, setMiddleItem] = useState("");
  const [lowerItem, setLowerItem] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [status, setStatus] = useState("stanby...");

  const delay = 2000;

  const openUpper = () => {
    writeOnCharacteristic(1);
  };
  const closeUpper = () => {
    writeOnCharacteristic(2);
  };
  const openMiddle = () => {
    writeOnCharacteristic(3);
  };
  const closeMiddle = () => {
    writeOnCharacteristic(4);
  };
  const openLower = () => {
    writeOnCharacteristic(5);
  };
  const closeLower = () => {
    writeOnCharacteristic(6);
  };

  const release = () => {
    writeOnCharacteristic(0);
  };

  const startAutomation = () => {
    setStatus("Menuju ruangan 1...");
    setTimeout(() => {
      writeRTDB("start-upper", true);
    }, 3000);
  };

  const deviceName = "ESP32";
  const bleService = "19b10000-e8f2-537e-4f6c-d104768a1214";
  const ledCharacteristic = "19b10002-e8f2-537e-4f6c-d104768a1214";
  const sensorCharacteristic = "19b10001-e8f2-537e-4f6c-d104768a1214";

  var bleServer;
  var bleServiceFound;
  var sensorCharacteristicFound;

  function handleCharacteristicChange(event) {
    const newValueReceived = new TextDecoder().decode(event.target.value);
    console.log("Characteristic value changed: ", newValueReceived);
  }

  function writeOnCharacteristic(value) {
    if (bleServer && bleServer.connected) {
      bleServiceFound
        .getCharacteristic(ledCharacteristic)
        .then((characteristic) => {
          console.log("Found the LED characteristic: ", characteristic.uuid);
          const data = new Uint8Array([value]);
          return characteristic.writeValue(data);
        })
        .then(() => {
          console.log("Value written to LEDcharacteristic:", value);
        })
        .catch((error) => {
          console.error("Error writing to the LED characteristic: ", error);
          writeOnCharacteristic(value);
        });
    } else {
      console.error(
        "Bluetooth is not connected. Cannot write to characteristic."
      );
      window.alert(
        "Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!"
      );
      connectToDevice();
    }
  }

  function onDisconnected(event) {
    connectToDevice();
  }

  function connectToDevice() {
    console.log("Initializing Bluetooth...");
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [bleService],
      })
      .then((device) => {
        console.log("Device Selected:", device.name);
        device.addEventListener("gattservicedisconnected", onDisconnected);
        return device.gatt.connect();
      })
      .then((gattServer) => {
        bleServer = gattServer;
        console.log("Connected to GATT Server");
        return bleServer.getPrimaryService(bleService);
      })
      .then((service) => {
        bleServiceFound = service;
        console.log("Service discovered:", service.uuid);
        return service.getCharacteristic(sensorCharacteristic);
      })
      .then((characteristic) => {
        console.log("Characteristic discovered:", characteristic.uuid);
      sensorCharacteristicFound = characteristic;
        characteristic.addEventListener(
          "characteristicvaluechanged",
          handleCharacteristicChange
        );
        characteristic.startNotifications();
        console.log("Notifications Started.");
        return characteristic.readValue();
      })
      .then((value) => {
        console.log("Read value: ", value);
        const decodedValue = new TextDecoder().decode(value);
        console.log("Decoded value: ", decodedValue);
      })
      .catch((error) => {
        console.log("Error: ", error);
      });
  }

  useEffect(() => {
    connectToDevice();

    return () => {};
  }, []);

  return (
    <Grid
      templateRows={{ base: "", md: "1fr auto" }}
      templateColumns={{ base: "", md: "repeat(3, 1fr)" }}
      gap={{ sm: 3, md: 5, lg: 6 }}
      p={{ sm: 3, md: 5, lg: 6 }}
      minH="100vh"
    >
      {/* MAP */}
      <GridItem
        rowSpan={2}
        colSpan={1}
        bg="white"
        py={5}
        px={6}
        rounded="md"
        shadow="md"
      >
        <Heading fontSize="xl" fontWeight="semibold">
          Map / Robot Position
        </Heading>
        <Center h="full">
          <Image src="https://iili.io/HnnuQGp.png" w="180px" />
        </Center>
      </GridItem>

      {/* SET DESTIANTION ROOM */}
      <GridItem colSpan={1} py={5} px={6} bg="white" rounded="md" shadow="md">
        <Flex direction="column" h="full">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>
            Set Destination Room
          </Heading>
          <OrderedList>
            {selectedRooms.map((room, i) => (
              <ListItem key={i}>Room: {room}</ListItem>
            ))}
          </OrderedList>
          <Spacer />
          <Flex justifyContent="space-around">
            {/* BUTTON ADD ROOM */}
            <Menu>
              <MenuButton as={Button} size="sm" colorScheme="teal">
                Add Room
              </MenuButton>
              <MenuList p={0}>
                {roomList.map((room, i) => (
                  <MenuItem p={0} key={i}>
                    <Button
                      onClick={() =>
                        setSelectedRooms((prev) => [...prev, roomList[i]])
                      }
                      variant="unstyled"
                      w="100%"
                      justifyContent="flex-start"
                    >
                      <Text textAlign="left" px={4}>
                        Room {room}
                      </Text>
                    </Button>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {/* BUTTON RESET ROOM */}
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => setSelectedRooms([])}
            >
              Reset Room
            </Button>
          </Flex>
        </Flex>
      </GridItem>

      {/* SET DRAWER ITEMS */}
      <GridItem
        colSpan={1}
        bg="white"
        py={5}
        px={6}
        rounded="md"
        shadow="md"
        position="relative"
      >
        <Flex h="full" direction="column">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>
            Set Drawer Items
          </Heading>
          <Text>Upper: {upperItem || "empty"}</Text>
          <Text>Middle: {middleItem || "empty"}</Text>
          <Text>Lower: {lowerItem || "empty"}</Text>
          <Spacer />
          <Flex justifyContent="space-around">
            {/* BUTTON ADD ITEMS */}
            <Button onClick={onOpen} colorScheme="teal" size="sm">
              Add Items
            </Button>

            {/* MODAL ADD ITEMS */}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Add Drawer Items</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Upper Drawer Items:</Text>
                  <Input
                    value={upperItem}
                    onChange={(e) => setUpperItem(e.target.value)}
                  />
                  <Text mt={4}>Middle Drawer Items:</Text>
                  <Input
                    value={middleItem}
                    onChange={(e) => setMiddleItem(e.target.value)}
                  />
                  <Text mt={4}>Lower Drawer Items:</Text>
                  <Input
                    value={lowerItem}
                    onChange={(e) => setLowerItem(e.target.value)}
                  />
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="blue" mr={3} onClick={onClose}>
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUpperItem("");
                      setMiddleItem();
                    }}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* BUTTON RESET ITEMS */}
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => {
                setUpperItem("");
                setMiddleItem("");
                setLowerItem("");
              }}
            >
              Reset Items
            </Button>
          </Flex>
        </Flex>
      </GridItem>

      {/* AUTOMATION */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Flex h="full" direction="column">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>
            Automation
          </Heading>
          <Spacer />
          <Button size="lg" mt={4} colorScheme="teal" onClick={startAutomation}>
            Start Robot Automation
          </Button>
          <Button size="lg" mt={4} colorScheme="red">
            Stop Robot Automation
          </Button>
        </Flex>
      </GridItem>

      {/* OPEN DRAWER */}
      <GridItem colSpan={1} bg="white" py={5} px={6} rounded="md" shadow="md">
        <Flex h="full" direction="column">
          <Heading fontSize="xl" fontWeight="semibold" mb={3}>
            Open Drawer
          </Heading>
          <Spacer />
          <Flex mt={4} justifyContent="center">
            <Button
              colorScheme="teal"
              onMouseDown={openUpper}
              onMouseUp={release}
              size="sm"
              w={40}
              mr={4}
            >
              Open Upper Drawer
            </Button>
            <Button
              colorScheme="teal"
              onMouseDown={closeUpper}
              onMouseUp={release}
              size="sm"
              w={40}
            >
              Close Upper Drawer
            </Button>
          </Flex>
          <Flex mt={4} justifyContent="center">
            <Button
              colorScheme="teal"
              onMouseDown={openMiddle}
              onMouseUp={release}
              size="sm"
              w={40}
              mr={4}
            >
              Open Middle Drawer
            </Button>
            <Button
              colorScheme="teal"
              onMouseDown={closeMiddle}
              onMouseUp={release}
              size="sm"
              w={40}
            >
              Close Middle Drawer
            </Button>
          </Flex>
          <Flex mt={4} justifyContent="center">
            <Button
              colorScheme="teal"
              onMouseDown={openLower}
              onMouseUp={release}
              size="sm"
              w={40}
              mr={4}
            >
              Open Lower Drawer
            </Button>
            <Button
              colorScheme="teal"
              onMouseDown={closeLower}
              onMouseUp={release}
              size="sm"
              w={40}
            >
              Close Lower Drawer
            </Button>
          </Flex>
        </Flex>
      </GridItem>
    </Grid>
  );
}

/*
<Flex mt={4} justifyContent="center">
            <Button colorScheme='teal' onMouseDown={openUpper} onMouseUp={release} size="sm" w={40} mr={4}>Open Upper Drawer</Button>
            <Button colorScheme='teal' onMouseDown={closeUpper} onMouseUp={release} size="sm" w={40}>Close Upper Drawer</Button>
          </Flex>
          <Flex mt={4} justifyContent="center">
            <Button colorScheme='teal' onMouseDown={openMiddle} onMouseUp={release} size="sm" w={40} mr={4}>Open Middle Drawer</Button>
            <Button colorScheme='teal' onMouseDown={closeMiddle} onMouseUp={release} size="sm" w={40}>Close Middle Drawer</Button>
          </Flex>
          <Flex mt={4} justifyContent="center">
            <Button colorScheme='teal' onMouseDown={openLower} onMouseUp={release} size="sm" w={40} mr={4} >Open Lower Drawer</Button>
            <Button colorScheme='teal' onMouseDown={closeLower} onMouseUp={release} size="sm" w={40} >Close Lower Drawer</Button>
          </Flex>
*/
