import { Box, Button, Divider, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Heading, Input, Text, useDisclosure } from "@chakra-ui/react";
import { useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi"

export default function ControlRoom() {

  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  return (
    <>
      {/* MOBILE SIDEBAR */}
      <Flex w="100vw" bg="teal.400" h={10} position="fixed" display={{ base: "flex", lg: "none" }} zIndex="sticky" alignContent="center">
        <Button display={{ lg: "none" }} ref={btnRef} colorScheme='teal' onClick={onOpen} rounded="none" bg="transparent" pos="absolute">
          <GiHamburgerMenu />
        </Button>
        <Text fontSize="xl" fontWeight="semibold" m="auto" color="white">
          MR-IAT ROBOT COVID
        </Text>
      </Flex>
      <Drawer isOpen={isOpen} placement='left' onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton   color="white"/>
          <DrawerBody p={0}>
            <SidebarContent />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* LARGE SIDEBAR */}
      <Box display={{ base: "none", lg: "block" }} pos="fixed" h="100vh" w={56} shadow="lg" >
        <SidebarContent />
      </Box>

      {/* PAGE CONTENT */}
      <Box ml={{ lg: 56 }} pt={{base: 10, lg: 0}} bg="linear-gradient(135deg, rgba(235,244,244,1) 0%, rgba(224,237,243,1) 50%, rgba(224,243,233,1) 100%);">
        <Outlet />
      </Box>
    </>
  );
}

const SidebarContent = () => {
  const styleNavLink = ({ isActive }) => {
    return {
      width: "100%",
      paddingLeft: "1.75rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      boxShadow: isActive ? "5px 0 0 teal inset" : "",
      display: "block",
      backgroundColor: isActive ? "#f9f9f9" : "",
      color: isActive ? "teal" : "",
      fontWeight: isActive ? "600" : "",
    };
  };

  return (
    <>
      <Box bg="teal.400" color="white">
        <Heading fontSize="xl" fontWeight="semibold" pt={5} pl={5}>
          MR-IAT <br />
          ROBOT COVID <br />
        </Heading>
        <Text pl={5}>Control Room</Text>
        <Divider pt={5} borderColor="gray.300" />
      </Box>

      <Box>

        {/* NAVIGATION LINK */}
        {/* ROBOT NAVIGATION */}
        <Text fontWeight="semibold" pl={5} pt={4} pb={2} fontSize="lg">Robot Navigation</Text>
        <NavLink style={styleNavLink} to="preparation-setup">Preparation Setup</NavLink>
        <NavLink style={styleNavLink} to="robot-monitoring">Robot Monitoring</NavLink>
        <NavLink style={styleNavLink} to="manual-navigation">Manual Navigation</NavLink>

        {/* MEDICAL CHECK UP */}
        <Text fontWeight="semibold" pl={4} pt={4} pb={2} fontSize="lg">Medical Check-Up</Text>
        <NavLink style={styleNavLink} to="data-colection-process">Data Collection Process</NavLink>
        <NavLink style={styleNavLink} to="bp-estimation">BP Estimation</NavLink>
        <NavLink style={styleNavLink} to="patients-data">Patients Data</NavLink>

      </Box>
    </>
  )
}