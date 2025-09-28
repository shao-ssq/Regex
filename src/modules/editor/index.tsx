import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAtomValue, useSetAtom } from "jotai"
import { useUpdateEffect } from "react-use"
import { useEventListener } from "usehooks-ts"
import clsx from "clsx"
import EditTab from "./edit-tab"
import LegendTab from "./legend-tab"
import TestTab from "./test-tab"
import SamplesTab from "./../samples/index"
import AgentTab from "./../agents/index"
import { useCurrentState } from "@/utils/hooks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  redoAtom,
  removeAtom,
  selectedIdsAtom,
  undoAtom
} from "@/atom"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type Tab = "legend" | "edit" | "test" | "samples" | "agent"
type Props = {
  defaultTab: Tab
  collapsed?: boolean
}

function Editor({ defaultTab, collapsed: initialCollapsed = false }: Props) {
  const selectedIds = useAtomValue(selectedIdsAtom)
  const remove = useSetAtom(removeAtom)
  const undo = useSetAtom(undoAtom)
  const redo = useSetAtom(redoAtom)

  const [tabValue, setTabValue, tabValueRef] = useCurrentState<Tab>(defaultTab)
  const [collapsed, setCollapsed] = useState(initialCollapsed)

  const { t } = useTranslation()

  useUpdateEffect(() => {
    setTabValue(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    if (selectedIds.length > 0 && tabValueRef.current !== "edit") {
      setTabValue("edit")
    }
    if (selectedIds.length === 0 && tabValueRef.current === "edit") {
      setTabValue("legend")
    }
  }, [selectedIds, tabValueRef, setTabValue])

  const editDisabled = selectedIds.length === 0

  useEventListener("keydown", (e: Event) => {
    const event = e as KeyboardEvent
    const tagName = (event.target as HTMLElement)?.tagName
    if (tagName === "INPUT" || tagName === "TEXTAREA") {
      return
    }
    const { key } = event
    if (key === "Backspace" || key === "Delete") {
      e.preventDefault()
      return remove()
    }
    const metaKey = event.ctrlKey || event.metaKey
    if (metaKey && event.shiftKey && key === "z") {
      e.preventDefault()
      return redo()
    }
    if (metaKey && key === "z") {
      e.preventDefault()
      return undo()
    }
  })

  const renderWidth =
    tabValue === "samples"
      ? "w-full"
      : "w-[305px]"

  return (
    <div className="flex flex-col relative h border-l py-4 transition-width">
      {/* 展开/收缩按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-10 top-4 rounded-full shadow"
      >
        {collapsed ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      <Tabs
        value={tabValue}
        onValueChange={(value: string) => setTabValue(value as Tab)}
        className={clsx(
          "flex flex-col h-full py-4 transition-all duration-300",
          collapsed ? "w-0 overflow-hidden" : renderWidth
        )}
      >
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TabsList className="grid grid-cols-5 mx-4 mb-6">
              <TabsTrigger value="agent">{t("Agent")}</TabsTrigger>
              <TabsTrigger value="legend">{t("Legends")}</TabsTrigger>
              <TabsTrigger value="test">{t("Test")}</TabsTrigger>
              <TabsTrigger
                value="edit"
                disabled={editDisabled}
                asChild={editDisabled}
                className={clsx(
                  { "cursor-not-allowed": editDisabled },
                  "!pointer-events-auto"
                )}
              >
                {editDisabled ? (
                  <TooltipTrigger>{t("Edit")}</TooltipTrigger>
                ) : (
                  t("Edit")
                )}
              </TabsTrigger>
              <TabsTrigger value="samples">{t("Samples")}</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
              <div className="w-auto p-4 pt-0">
                <TabsContent value="agent">
                  <AgentTab />
                </TabsContent>
                <TabsContent value="edit">
                  <EditTab />
                </TabsContent>
                <TabsContent value="test">
                  <TestTab />
                </TabsContent>
                <TabsContent value="legend">
                  <LegendTab />
                </TabsContent>
                <TabsContent value="samples">
                  <SamplesTab />
                </TabsContent>
              </div>
            </ScrollArea>
            <TooltipContent>
              <p>{t("You have to select nodes first")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Tabs>
    </div>
  )
}

export default Editor
