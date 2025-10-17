"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/db/supabaseClient";

interface Data {
  name: string;
  height: string;
}

export default function Page(props: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  useEffect(() => {
    const fetchData = async () => {
      const data = await supabase.from("shop_token").select("*")
      console.log(data)
    }
    fetchData()
  }, [])
  const [response, setResponse] = useState<Data | null>(null);

  const handleGetAPIRequest = async () => {
    try {
      const res = await fetch("/api/hello");
      const result = (await res.json()) as { data: Data };
      setResponse(result.data);
    } catch (err) {
      console.log(err);
    }
  };

  const params = props.searchParams;

  return (
    <>
      <h1>Shop: {params.shop}, Host: {params.host}</h1>
      <button onClick={handleGetAPIRequest}>API起動!</button>
      {response && (
        <p>{response.name} is {response.height} tall</p>
      )}
    </>
  );
}
