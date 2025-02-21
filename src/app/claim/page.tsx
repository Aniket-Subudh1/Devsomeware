/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import React, { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
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
  //handle scan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = (result: { rawValue: any; }[]) => {
    console.log(result[0].rawValue);
    setLoading(true);
    setRender(false);
    setRenderModal(true);

  }
  return (
    <div className='flex justify-center items-center  flex-col mb-10 lg:min-h-screen'>
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
    <ZenotroneEventDialog renderModal={renderModal} setRenderModal={setRenderModal} setRender={setRender}/>
    </div>
   
  )
}

export default page
