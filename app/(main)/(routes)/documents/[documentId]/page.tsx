'use client'

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentIdProps{
    params:{
        documentId:Id<'documents'>
    }
}

export default function DocumentPage({params}:DocumentIdProps) {
    const document=useQuery(api.documents.getById,{
        documentId:params.documentId
    })

    const update=useMutation(api.documents.update)

    const Editor=useMemo(()=>dynamic(()=>import("@/components/editor"),{ssr:false}),[])

    const onChange=(content:string)=>{
        update({
            id:params.documentId,
            content
        })
    }

    if (document === undefined) {
        return (
          <div>
            <Cover.Skeleton />
            <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
              <div className="space-y-4 pl-8 pt-4">
                <Skeleton className="h-14 w-1/2" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
          </div>
        );
      }
    if(document === null){
        return null
    }
    return (
        <div className="pb-40">
            <Cover url={document.coverImage} />
      <div className="mx-auto md:max-w-3xl lg:max-w-4xl">
        <Toolbar initialData={document} />
        <Editor onChange={onChange} initialContent={document.content} />
      </div>
    </div>
    );
}