'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../lib/store';
import { add } from '../lib/features/user/userSlice';

export default function StoreProvider({
  children,
  initialUserData,
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
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (initialUserData?.isauth) {
      
      storeRef.current.dispatch(add(initialUserData));
    }
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
