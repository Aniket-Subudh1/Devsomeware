/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import React, { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { Toaster,toast } from 'sonner';
import ZenotroneEventDialog from '@/utils/TicketModal';
const page = () => {
  const [render,setRender] = useState(true);
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState('');
  const [renderModal,setRenderModal] = useState(false);
  const refresh = ()=>{
    setRender(false)
    setTimeout(()=>{
      setRender(true)
    },1000);
  }
  //senda request to the server for getting data
  const sendRequest = async (id:string)=>{
    try{
     setLoading(true);
     const res = await fetch(`/api/claim?id=${id}`);
      const data = await res.json();
      setLoading(false);
      if(data.success){
        setResult(data.data);
        setRenderModal(true);
      }
      else{
        toast.error(data.message);
      }
    }
    catch(err){
      console.log(err);
      toast.error('Something went wrong try again after sometime');
    }
  }
  //handle scan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = (result: { rawValue: any; }[]) => {
    setLoading(true);
    setRender(false);
    sendRequest(result[0].rawValue);

  }
  return (
    <div className='flex justify-center items-center  flex-col mb-10 lg:min-h-screen'>
    <Toaster richColors position='top-center'/>
      <img src="/hack.png" alt="logo" className="lg:hidden block" />
    <h1 className='text-3xl font-bold text-center'>QR Scanner</h1>
 <div className='container h-96 w-96 lg:[300px] lg:h-[300px] '>
      { render&& <Scanner onScan={(result) => handleScan(result)} />}
      {!render&& <div className="flex justify-center items-center h-full w-full">
      <div className="animate-spin">
        <Loader size={64} />
      </div>
    </div>}
    {loading&& <div className="flex justify-center items-center h-full w-full">
      <div className="animate-spin">
        <Loader size={64} />
      </div>
    </div>}
    </div>
    <div>
<Button onClick={refresh}>Refresh Scanner</Button>
    </div>
    <ZenotroneEventDialog renderModal={renderModal} setRenderModal={setRenderModal} setRender={setRender} result={result}/>
    </div>
   
  )
}

export default page
