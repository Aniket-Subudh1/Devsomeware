'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../lib/store';
import { add } from '../lib/features/user/userSlice';
import { add as addevent } from '../lib/features/events/eventSlice';
export default function StoreProvider({
  children,
  initialUserData,
  eventdata,
}: {
  children: React.ReactNode;
  initialUserData: {
    name: string;
    email: string;
    img: string;
    isauth: boolean;
    github: string;
    linkedin: string;
    intrests: string[];
    languages: string[];
    frameworks: string[];
    bio: string;
  } | null;
  eventdata:{
    userid:string,
    eventid:string,
    eventname:string,
    ticketid:string,
    email:string,
    iszentrone:boolean,
  }
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (initialUserData?.isauth) {
      console.log("initialUserData",initialUserData);
      console.log("eventdata",eventdata);
      storeRef.current.dispatch(add(initialUserData));
      storeRef.current.dispatch(addevent(eventdata));
    }
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
