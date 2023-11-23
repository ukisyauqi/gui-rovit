import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import Html5QrcodePlugin from "./Html5QrcodePlugin";
import { useEffect } from "react";

export default function ModalScanSensor(props) {
  const toast = useToast();

  const onNewScanResult = (decodedText, decodedResult) => {
    // validate sensor id
    const validIds = ["R3K7Q", "P9A2G", "L5W1D", "M8F4H", "T2N6E", "M0S4F"];
    if (validIds.includes(decodedText)) {
      props.setSensorId(decodedText);
      sessionStorage.setItem("sensorId", decodedText)
    } else {
      toast({
        description: "Sensor Invalid",
        status: "error",
      }); 
    }
  };

  useEffect(() => {
    props.setSensorId("");
  }, []);

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan QR Code Sensor</ModalHeader>
          <ModalCloseButton />
          <ModalBody marginBottom={4}>
            {props.sensorId == "" ? (
              <Html5QrcodePlugin
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
              />
            ) : (
              props.onClose()
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
