import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [room, setRoom] = useState("control-room/bp-estimation");

  const navigate = useNavigate()
  const toast = useToast();

  const handleLogin = () => {
    if (email !== "rkiunpad@gmail.com" && password !== "cognounpad") {
      toast({
        title: "Email atau Password Salah",
        status: "error",
        duration: 2000,
        isClosable: true,
      })
      return
    }
    navigate(room)
  }

  return (
    <Flex w="100vw" h="100vh" overflow="hidden" display={{base: "block", md: "flex"}}>

      <Center flex="1" bg="teal.50" py={10}>
        <Box px={10} textAlign="center">
          <Heading>MR-IAT Robot Covid</Heading>
          <br />
          <Text>
            Medical Robot - Controlled Intelligent Assisted Technology (MR-IAT)
            adalah produk robot untuk membantu penanganan COVID-19 di lingkungan
            rumah sakit yang dilengkapi dengan akuisisi data biosinyal,
            pemrosesan sinyal dan gambar, sistem vision, pemetaan, lokalisasi,
            dan intelligence control
          </Text>
        </Box>
      </Center>

      <Center flex="1" py={10}>
        <Box>
          <Heading textAlign="center">Login Authentication</Heading>
          <br />
          <Text>Email:</Text>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <Text mt={2}>Password:</Text>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          <br /><br />
          <RadioGroup colorScheme="teal" onChange={setRoom} value={room}>
            <Stack direction="column">
              <Radio value="control-room/bp-estimation">Control Room</Radio>
              <Radio value="patient-room">Patient Room</Radio>
            </Stack>
          </RadioGroup>
          <br />
          <Button colorScheme="teal" w="full" onClick={handleLogin}>Login</Button>
        </Box>
      </Center>
      
    </Flex>
  );
}
