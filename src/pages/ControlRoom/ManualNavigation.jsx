import { useEffect, useState, useRef } from "react";

export default function ManualNavigation() {
  const nilai = useRef(10)

  useEffect(() => {
    console.log(nilai)
  
    return () => {
      
    }
  }, [])
  

  return <div></div>;
}
