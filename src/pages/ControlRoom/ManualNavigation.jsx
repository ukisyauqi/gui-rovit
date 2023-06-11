import { Box } from "@chakra-ui/react";
import React from "react";

export default function ManualNavigation() {
  const myHtml = `
    
    <py-script>
      coba = js.document.getElementById("coba")

      for i in range(100):
        coba.innerHTML = i

    </py-script>
  `;

  return (
    <>
      <Box position={'relative'}>
        <div dangerouslySetInnerHTML={{ __html: myHtml }}></div>
      </Box>
      <div id="coba">10</div>
    </>
  );
}
