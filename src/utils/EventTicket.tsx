"use client"
import type React from "react"
import { motion } from "framer-motion"
import { CalendarDays, MapPin } from "lucide-react"

interface EventTicketProps {
  eventName: string
  date: string
  location: string
  ticketId: string
}

const EventTicket: React.FC<EventTicketProps> = ({ eventName, date, location, ticketId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto my-8"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {/* Ticket Content */}
        <div className="relative p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white"
          >
            <h2 className="text-4xl font-extrabold mb-2 tracking-tight">{eventName}</h2>
            <div className="flex items-center mb-2">
              <CalendarDays className="w-5 h-5 mr-2" />
              <p className="text-xl">{date}</p>
            </div>
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <p className="text-xl">{location}</p>
            </div>
          </motion.div>

          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white p-4 rounded-lg inline-block mb-4 shadow-lg"
          >
            {/* <QRCodeSVG value={ticketId} size={128} /> */}
          </motion.div>

          {/* Ticket ID */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-white text-sm"
          >
            <span className="font-semibold">Ticket ID:</span> {ticketId}
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white bg-opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white bg-opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </motion.div>
  )
}

export default EventTicket

