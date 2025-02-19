"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/utils/Admin/login-form";
import { DataTable } from "@/utils/Admin/data-table";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [data,setData] = useState([]);
  const fetchalldata = async ()=>{
    const res = await fetch("/api/userdata");
    const response = await res.json();
    setData(response.data);
  }
useEffect(()=>{
fetchalldata(); 
},[])   

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!isLoggedIn ? (
        <LoginForm onLogin={setIsLoggedIn} />
      ) : (
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">Data Table</h1>
          <DataTable data={data} />
        </div>
      )}
    </main>
  )
}

