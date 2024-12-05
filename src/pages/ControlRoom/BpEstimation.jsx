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
  scaleFadeConfig,
  Spacer,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { writeRTDB, rtdb, storage } from "../../firebase";
import { onValue, ref } from "firebase/database";
import { getDownloadURL } from "firebase/storage";
import { Line } from "react-chartjs-2";
import axios from 'axios';
import { SENSOR_NAME, SERVICE_UUID, SENSOR_CHARACTERISTIC_UUID } from "../../util/alat_sensor_utility";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ModalScanSensor from "../../../archive/ModalScanSensor";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpeechSynthesis } from "react-speech-kit";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const placeholderChart = {
  labels: [0],
  datasets: [
    {
      label: "PPG Signal",
      data: [0],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

export default function BpEstimation() {
  const toast = useToast();
  const { speak, voices } = useSpeechSynthesis();

  // react states
  const [inputName, setInputName] = useState("");
  const [inputAge, setInputAge] = useState("");
  const [inputWeight, setInputWeight] = useState("");
  const [inputTemperature, setInputTemperature] = useState("");
  const [inputSystole, setInputSystole] = useState("");
  const [inputDiastole, setInputDiastole] = useState("");
  const [inputRespiration, setInputRespiration] = useState("");
  const [chartData, setChartData] = useState(placeholderChart);
  const [result, setResult] = useState({
    systole: "",
    diastole: "",
    bpm: "",
    ibi: "",
    sdnn: "",
    rmssd: "",
    sdsd: "",
  });
  const btnRefEstimateBpStart = useRef(null);
  const isRecording = useRef(false);
  const [suhu, setSuhu] = useState(0);
  const signal = useRef(Array(2000).fill(0));
  const [isSensorConnected, setIsSensorConnected] = useState(false);

  // helper functions
  function getTimeStamp() {
    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

// const mockPPG = [1319,1358,1423,1487,1562,1632,1721,1758,1801,1842,1858,1861,1851,1831,1808,1787,1716,1693,1648,1603,1574,1551,1521,1504,1501,1491,1495,1493,1499,1518,1522,1535,1555,1566,1582,1587,1591,1599,1606,1611,1613,1613,1610,1601,1606,1602,1625,1666,1758,1891,2064,2256,2470,2680,2849,2986,3071,3086,3034,2928,2771,2614,2426,2231,2047,1879,1723,1590,1479,1391,1334,1293,1282,1296,1328,1373,1424,1497,1567,1635,1712,1774,1815,1853,1869,1872,1867,1856,1827,1793,1747,1708,1662,1625,1593,1563,1543,1528,1510,1517,1520,1532,1535,1552,1566,1578,1587,1601,1613,1617,1621,1633,1635,1633,1635,1626,1629,1635,1663,1722,1836,1987,2176,2384,2595,2797,2962,3088,3159,3158,3077,2949,2787,2618,2432,2246,2065,1893,1743,1600,1498,1424,1360,1333,1323,1337,1377,1414,1485,1615,1635,1712,1770,1813,1851,1875,1883,1870,1845,1814,1774,1738,1698,1662,1635,1605,1580,1567,1555,1562,1562,1567,1582,1584,1600,1612,1622,1633,1639,1601,1632,1644,1641,1645,1646,1645,1642,1639,1633,1645,1651,1673,1750,1863,2032,2240,2475,2712,2928,3125,3307,3376,3365,3253,3095,2896,2699,2494,2285,2082,1913,1778,1635,1520,1435,1382,1350,1328,1353,1385,1425,1472,1566,1629,1691,1750,1802,1840,1871,1878,1872,1857,1834,1793,1751,1705,1647,1600,1558,1513,1484,1451,1422,1416,1418,1421,1429,1451,1462,1485,1498,1520,1555,1573,1599,1603,1611,1613,1619,1627,1619,1616,1616,1599,1599,1606,1628,1687,1793,1949,2146,2369,2599,2800,2953,3121,3205,3184,3103,2959,2788,2597,2389,2192,2006,1827,1675,1548,1445,1367,1313,1290,1284,1279,1314,1454,1411,1478,1546,1609,1668,1712,1756,1773,1794,1803,1787,1764,1744,1704,1667,1637,1600,1573,1534,1531,1493,1499,1486,1488,1498,1510,1520,1528,1556,1571,1597,1610,1632,1641,1648,1659,1678,1687,1711,1694,1706,1696,1685,1686,1695,1719,1789,1887,2031,2218,2438,2627,2805,2979,3101,3152,3132,3053,2909,2756,2596,2384,2210,2039,1877,1738,1616,1511,1425,1369,1347,1345,1360,1410,1437,1495,1562,1634,1703,1762,1812,1854,1877,1891,1887,1879,1857,1795,1789,1749,1712,1678,1613,1599,1569,1533,1521,1517,1508,1514,1517,1521,1524,1546,1552,1563,1573,1584,1586,1585,1600,1629,1648,1712,1808,1954,2154,2374,2599,2818,3011,3199,3271,3266,3214,3067,2887,2701,2509,2317,2123,1952,1794,1664,1567,1473,1415,1380,1362,1365,1382,1423,1469,1523,1587,1664,1717,1774,1809,1840,1835,1808,1831,1814,1776,1745,1713,1665,1632,1597,1570,1547,1520,1513,1507,1511,1520,1535,1530,1553,1564,1575,1585,1589,1609,1616,1617,1619,1616,1621,1623,1635,1677,1763,1895,2062,2277,2495,2722,2922,3071,3158,3174,3114,2989,2878,2640,2433,2231,2033,1855,1698,1565,1454,1365,1261,1291,1269,1300,1322,1371,1429,1495,1563,1640,1707,1747,1794,1809,1821,1810,1790,1770,1729,1695,1645,1605,1559,1520,1486,1458,1453,1437,1438,1446,1457,1471,1511,1493,1510,1523,1525,1547,1551,1556,1567,1565,1566,1574,1565,1570,1580,1600,1639,1736,1856,2020,2211,2414,2590,2753,2853,2922,2913,2864,2769,2647,2475,2368,2159,1993,1841,1715,1593,1506,1434,1401,1371,1383,1387,1408,1471,1520,1601,1672,1735,1792,1835,1875,1899,1904,1898,1886,1857,1810,1776,1734,1689,1657,1622,1598,1578,1556,1550,1535,1520,1531,1518,1535,1546,1552,1559,1553,1571,1566,1596,1627,1700,1799,1918,2128,2320,2518,2670,2797,2882,2901,2874,2797,2679,2538,2383,2224,2063,1920,1783,1667,1568,1475,1499,1469,1338,1392,1430,1488,1563,1638,1722,1787,1854,1906,1937,1954,1961,1936,1887,1861,1814,1775,1715,1661,1601,1524,1561,1543,1521,1520,1523,1522,1543,1549,1521,1575,1594,1607,1616,1634,1686,1769,1901,2069,2309,2498,2739,2944,3138,3269,3317,3271,3149,2975,2797,2587,2384,2176,1991,1824,1676,1555,1456,1379,1335,1311,1309,1326,1366,1415,1472,1547,1615,1674,1731,1727,1813,1828,1831,1819,1799,1783,1746,1714,1680,1648,1614,1587,1573,1547,1533,1549,1533,1527,1549,1553,1563,1525,1566,1570,1571,1584,1586,1603,1625,1685,1795,1954,2160,2384,2637,2885,3116,3295,3369,3376,3358,3169,2960,2771,2559,2335,2131,1947,1789,1648,1470,1435,1371,1338,1328,1362,1408,1460,1522,1612,1681,1745,1810,1859,1890,1841,1884,1865,1831,1778,1721,1648,1580,1582,1514,1482,1442,1426,1422,1424,1423,1425,1454,1477,1515,1517,1543,1558,1584,1595,1611,1616,1617,1622,1627,1645,1680,1759,1881,2064,2276,2512,2750,2950,3125,3233,3231,3182,3040,2861,2663,2448,2238,2032,1856,1664,1526,1402,1311,1249,1222,1215,1232,1311,1336,1503,1472,1571,1648,1714,1778,1811,1839,1846,1841,1823,1787,1755,1713,1680,1645,1616,1589,1552,1522,1509,1495,1482,1481,1479,1491,1502,1517,1520,1523,1489,1642,1555,1552,1571,1568,1578,1570,1569,1557,1556,1563,1613,1701,1851,2055,2288,2528,2768,2970,3142,3249,3163,3148,2988,2807,2608,2387,2176,1964,1763,1596,1449,1328,1246,1211,1185,1206,1243,1307,1386,1472,1558,1680,1743,1822,1873,1914,1932,1927,1919,1857,1813,1757,1714,1652,1613,1570,1518,1490,1467,1439,1459,1429,1442,1447,1457,1477,1490,1509,1521,1543,1552,1565,1563,1578,1583,1585,1590,1593,1610,1628,1680,1757,1903,2085,2283,2496,2709,2885,3024,3090,3088,3010,2863,2705,2513,2319,2113,1909,1729,1572,1427,1322,1233,1187,1168,1168,1200,1246,1310,1391,1469,1520,1634,1665,1759,1792,1826,1830,1827,1814,1789,1751,1719,1686,1648,1622,1594,1584,1571,1564,1563,1561,1568,1596]

  const startAmbilData = () => {
    axios.post("https://api.ppg.millenia911.net", { "age": parseInt(inputAge), "weight": parseInt(inputWeight), "ppg": signal.current.map((str) => parseFloat(str, 10)) })
      .then((response) => {
        console.log(response.data)
        writeRTDB("data/" + getTimeStamp(), {
          nama: inputName,
          umur: inputAge,
          weight: inputWeight,
          temperature: inputTemperature,
          inputSystole: inputSystole,
          inputDiastole: inputDiastole,
          inputRespiration: inputRespiration,
          systole: response.data.estimated_systole,
          diastole: response.data.estimated_diastole,
          respiration: response.data.estimated_respiratory_rate,
          sinyal: signal.current,
          bpm: response.data.bpm,
          ibi: response.data.ibi,
          sdnn: response.data.sdnn,
          rmssd: response.data.rmssd,
          sdsd: response.data.sdsd,
        })
        setResult({
          nama: inputName,
          umur: inputAge,
          weight: inputWeight,
          temperature: inputTemperature,
          inputSystole: inputSystole,
          inputDiastole: inputDiastole,
          inputRespiration: inputRespiration,
          systole: response.data.estimated_systole,
          diastole: response.data.estimated_diastole,
          respiration: response.data.estimated_respiratory_rate,
          sinyal: signal.current,
          bpm: response.data.bpm,
          ibi: response.data.ibi,
          sdnn: response.data.sdnn,
          rmssd: response.data.rmssd,
          sdsd: response.data.sdsd,
        })
        toast({
          title: "Estimate BP Success",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      })
      .catch(function (error) {
        console.log(error);
        toast({
          title: "Estimate BP Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      });
  };

  // USE EFFECTS
  useEffect(() => {
    const unsubscribes = [];

    unsubscribes.push(
      onValue(ref(rtdb, "L5W1D/suhu"), (snapshot) => {
        const data = snapshot.val();
        setSuhu(data.toFixed(2));
      })
    );

    return () => {
      unsubscribes.map((unsubscribe) => unsubscribe());
    };
  }, []);

  const deviceName = "ESP32";
  const bleService = "19b10000-e8f2-537e-4f6c-d104768a1215";
  const sensorCharacteristic = "19b10001-e8f2-537e-4f6c-d104768a1215";

  var bleServer;
  var bleServiceFound;
  var sensorCharacteristicFound;

  let i = 0;
  let disconnectTimeout;
  let newValueReceived

  function handleCharacteristicChange(event) {
    newValueReceived = new TextDecoder().decode(event.target.value);
    // console.log(newValueReceived);
    setIsSensorConnected(true)
    signal.current.push(newValueReceived);
    signal.current.shift();
    i++;

    if (i % 50 === 0) {
      clearTimeout(disconnectTimeout)
      disconnectTimeout = setTimeout(() => {
        setIsSensorConnected(false)
        toast({
          title: "Sensor Disconected",
          status: "error",
          duration: 1000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload()
        }, 2000);
      }, 1000);

      i = 0;
      setChartData({
        labels: [],
        datasets: [
          {
            label: "PPG signal",
            data: signal.current.reduce((acc, value, index) => {
              acc[index] = value;
              return acc;
            }, {}),
            borderWidth: 2,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            pointRadius: 1,
          },
        ],
      });
    }
  }

  const estimateBPError = () => {
    isRecording.current = false;
    toast({
      title: window.messageError ?? "error",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  };

  function onDisconnected(event) {
    console.log('Device Disconnected:', event.target.device.name);
    window.location.reload()
  }

  function connectToDevice() {
    let sensorIndex
    console.log("Initializing Bluetooth...");
    navigator.bluetooth
      .requestDevice({
        filters: SENSOR_NAME.map(name => ({ name })),
        optionalServices: SERVICE_UUID 
      })
      .then((device) => {
        console.log("Device Selected:", device.name);
        sensorIndex = SENSOR_NAME.indexOf(device.name)
        device.addEventListener("gattservicedisconnected", onDisconnected);
        return device.gatt.connect();
      })
      .then((gattServer) => {
        bleServer = gattServer;
        console.log("Connected to GATT Server");
        return bleServer.getPrimaryService(SERVICE_UUID[sensorIndex]);
      })
      .then((service) => {
        bleServiceFound = service;
        console.log("Service discovered:", service.uuid);
        return service.getCharacteristic(SENSOR_CHARACTERISTIC_UUID[sensorIndex]);
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

  return (
    <>
      <div style={{ display: "none" }}>
        <button id="estimateBPStart" ref={btnRefEstimateBpStart}></button>
        <button id="estimateBPError" onClick={estimateBPError}></button>
        <p id="ppg"></p>
        <p id="systole"></p>
        <p id="diastole"></p>
      </div>

      {/* <Center
        position={"fixed"}
        top={0}
        left={0}
        w={"full"}
        h={"100vh"}
        backdropFilter={"blur(3px)"}
        zIndex={100}
        id="preparingEnvironment"
      >
        <Button
          background={"teal"}
          p={10}
          rounded={"xl"}
          shadow={"2xl"}
          isLoading
          loadingText="Preparing Environment"
          colorScheme="teal"
          size={"lg"}
        ></Button>
      </Center> */}

      <Grid
        templateColumns={{ base: "", md: "auto 1fr 1fr" }}
        templateRows={{ base: "", md: "1fr auto" }}
        gap={{ sm: 3, md: 5, lg: 6 }}
        p={{ sm: 3, md: 5, lg: 6 }}
        minH="100vh"
      >
        <GridItem
          colSpan={{ base: 1, md: 3 }}
          bg="white"
          py={5}
          px={6}
          rounded="md"
          shadow="md"
        >
          <Heading fontSize="xl" fontWeight="semibold" mb={4}>
            Grafik Sinyal Photoplethysmograph (PPG)
          </Heading>
          <Line options={{ animation: false }} data={chartData} />
        </GridItem>

        <GridItem
          colSpan={1}
          bg="white"
          py={4}
          px={6}
          rounded="md"
          mt={{ base: 5, md: 0 }}
          shadow="md"
          width={{ base: "100vw", md: "fit-content" }}
        >
          <Flex justifyContent="space-between">
            <Heading fontSize="xl" fontWeight="semibold" mb={2}>
              Aksi
            </Heading>
            <Button
              onClick={() => {
                connectToDevice();
              }}
              size="sm"
              variant="link"
              colorScheme="teal"
              mb={2}
            >
              {isSensorConnected ? "Connected" : "Connect to Sensor"}
            </Button>
          </Flex>
          <Input
            placeholder="Masukan Nama Responden"
            shadow={"sm"}
            value={inputName}
            onChange={(event) => setInputName(event.target.value)}
          />

          <Flex mt={2} w="full" gap={2}>
            <Input
              placeholder="Usia"
              shadow={"sm"}
              value={inputAge}
              onChange={(event) => setInputAge(event.target.value)}
              w={140}
              flexGrow={1}
            />
            <Input
              flexGrow={1}
              w={150}
              placeholder="Berat Badan"
              shadow={"sm"}
              value={inputWeight}
              onChange={(event) => setInputWeight(event.target.value)}
            />
          </Flex>
          {/* <Flex mt={2} visibility={"hidden"}> */}
          <Flex mt={2} gap={2}>
            <Input
              placeholder="Actual Systole"
              shadow={"sm"}
              value={inputSystole}
              onChange={(event) => setInputSystole(event.target.value)}
            />
            <Input
              placeholder="Actual Diastole"
              shadow={"sm"}
              value={inputDiastole}
              onChange={(event) => setInputDiastole(event.target.value)}
            />
            <Input
              placeholder="Actual Respiration"
              shadow={"sm"}
              value={inputRespiration}
              onChange={(event) => setInputRespiration(event.target.value)}
            />
          </Flex>
          <Flex mt={2}>
            <Button colorScheme="teal" w="full" onClick={startAmbilData}>
              Mulai Estimasi
            </Button>
          </Flex>
        </GridItem>

        <GridItem
          colSpan={1}
          bg="white"
          py={5}
          px={6}
          rounded="md"
          mt={{ base: 5, md: 0 }}
          shadow="md"
        >
          <Heading fontSize="xl" fontWeight="semibold" mb={4}>
            Hasil estimasi
          </Heading>
          <Text align={"center"} my={{ base: 10, md: 16 }} fontSize={"lg"}>
            Systole: <b>{result?.systole}</b>
            <br />
            Diastole: <b>{result?.diastole}</b>
            <br />
            Respiration: <b>{result?.respiration}</b>
            <br />
            {/* {suhu ? "Suhu: " + suhu : ""} */}
          </Text>
        </GridItem>

        <GridItem
          colSpan={1}
          bg="white"
          py={5}
          px={6}
          rounded="md"
          my={{ base: 5, md: 0 }}
          shadow="md"
        >
          <Heading fontSize="xl" fontWeight="semibold" mb={4}>
            PPG Extraction
          </Heading>
          <Text
            mt={8}
            fontSize={"lg"}
            fontStyle={"italic"}
            ml={16}
            mb={{ base: 10, md: 0 }}
          >
            bpm: {result?.bpm}
            <br />
            ibi: {result?.ibi}
            <br />
            sdnn: {result?.sdnn}
            <br />
            rmssd: {result?.rmssd}
            <br />
            sdsd: {result?.sdsd}
          </Text>
        </GridItem>
      </Grid>
    </>
  );
}
