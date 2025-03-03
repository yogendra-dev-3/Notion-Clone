"use client";
import { ElementRef, useCallback, useEffect, useRef, useState } from "react";
import { ChevronsLeft, MenuIcon, Plus, PlusCircleIcon, Search, Settings, Trash } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { useParams, usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import UserItem from "./user-item";
import {useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { DocumentList } from "./document-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrashBox } from "./trash-box";

import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import Navbar from "./navbar";
import { Item } from "./item";

export const Navigation = () => {
  const router=useRouter()
  const pathname = usePathname();
  const params=useParams()
  const isMobile = useMediaQuery("(max-width:768px)");
  const create=useMutation(api.documents.create)

  const search=useSearch()
  const settings=useSettings()

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = e.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty(
        "width",
        `calc(100% - ${newWidth}px)`,
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth =useCallback(() => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.removeProperty("width");
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100%-240px)",
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");
      setTimeout(() => setIsResetting(false), 300);
    }
  },[isMobile]) ;

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const handleCreate=()=>{
    const promise= create({title:"Untitled"})
    .then((documentId)=>router.push(`/documents/${documentId}`))
    toast.promise(promise,{
      loading:"Creating a new note...",
      success:"New note created!",
      error:"Failed to create a new note."
    })
  }

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile,resetWidth]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar relative z-[300] flex h-full w-60 flex-col overflow-y-auto bg-secondary",
          isResetting && "transition-all duration-300 ease-in-out",
          isMobile && "w-0",
        )}
      >
        <div
            onClick={collapse}
            role="button"
            className={cn(
              "absolute right-2 top-3 h-6 w-6 rounded-sm text-muted-foreground opacity-0 transition hover:bg-neutral-300 group-hover/sidebar:opacity-100 dark:hover:bg-neutral-600",
              isMobile && "opacity-100",
            )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
          <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
          <Item onClick={handleCreate} label='New page' icon={PlusCircleIcon} />
            
        </div>
        <div className="mt-4">
            <DocumentList />
            <Item label="Add a page" icon={Plus} onClick={handleCreate} />
            <Popover>
            <PopoverTrigger className="mt-4 w-full">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent
              side={isMobile ? "bottom" : "right"}
              className="w-72 p-0"
            >
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-primary/10 opacity-0 transition group-hover/sidebar:opacity-100"
        ></div>
      </aside>
      <div
        ref={navbarRef}
        onClick={resetWidth}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
          {!! params.documentId ?
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
          : <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <MenuIcon role="button" className="h-6 w-6 text-muted-foreground" />
          )}
        </nav>}
        
      </div>
    </>
  );
};
