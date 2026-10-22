

import UniqueExecption from "@/exceptions/unique-exception";
import { zodValidationSchema } from "@/types/client";
import { NextRequest, NextResponse } from "next/server";
import {UserService} from "@/services/user-service";




export async function POST(request: NextRequest) {
  
  const body = await request.json().catch(() => null);


  //validation
const parseData = zodValidationSchema.safeParse(body);
if (!parseData.success) {
  return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
}
 
  try {
    const client = await UserService.createClients(parseData.data);
     return NextResponse.json({ client }, { status: 201 });

     
  } catch (error:any) { 
    if(error instanceof UniqueExecption){
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("POST /api/clients failed:", error)
    return NextResponse.json(error, { status: 500 });
    
  }

 
} 

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);//request.url == http://localhost:3000/api/clients/4
  const search = searchParams.get("search") ?? undefined;

  try {
    const clients = await UserService.getClients(search);
    return NextResponse.json( clients , { status: 200 });// {ma3enta badi client tbayen bl response ex:clients:[...]}
  } catch (error: any) {
    console.error("GET /api/clients failed:", error);
    return NextResponse.json({ error: "Error fetching clients" }, { status: 500 });
  }
}