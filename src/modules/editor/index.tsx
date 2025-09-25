import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAtomValue, useSetAtom } from 'jotai'
import { useUpdateEffect } from 'react-use'
import { useEventListener } from 'usehooks-ts'
import clsx from 'clsx'
import EditTab from './edit-tab'
import LegendTab from './legend-tab'
import TestTab from './test-tab'
import SamplesTab from './../samples/index'
import AgentTab from './../agents/index'
import { useCurrentState } from '@/utils/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  redoAtom,
  removeAtom,
  selectedIdsAtom,
  undoAtom,
} from '@/atom'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NavLink } from "react-router-dom"

export type Tab = 'legend' | 'edit' | 'test' | 'samples' | 'agent'
type Props = {
  defaultTab: Tab
  collapsed: boolean
}

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return clsx('transition-colors hover:text-foreground/80 text-sm', isActive ? 'text-foreground' : 'text-foreground/60')
}

function Editor({ defaultTab, collapsed }: Props) {
  const selectedIds = useAtomValue(selectedIdsAtom)
  const remove = useSetAtom(removeAtom)
  const undo = useSetAtom(undoAtom)
  const redo = useSetAtom(redoAtom)

  const [tabValue, setTabValue, tabValueRef] = useCurrentState<Tab>(defaultTab)

  const { t } = useTranslation()

  useUpdateEffect(() => {
    setTabValue(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    if (selectedIds.length > 0 && tabValueRef.current !== 'edit') {
      setTabValue('edit')
    }
    if (selectedIds.length === 0 && tabValueRef.current === 'edit') {
      setTabValue('legend')
    }
  }, [selectedIds, tabValueRef, setTabValue])

  const editDisabled = selectedIds.length === 0

  useEventListener('keydown', (e: Event) => {
    const event = e as KeyboardEvent
    const tagName = (event.target as HTMLElement)?.tagName
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      return
    }
    const { key } = event
    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      return remove()
    }
    const metaKey = event.ctrlKey || event.metaKey
    if (metaKey && event.shiftKey && key === 'z') {
      e.preventDefault()
      return redo()
    }
    if (metaKey && key === 'z') {
      e.preventDefault()
      return undo()
    }
  })

  const renderWidth =
    tabValue === 'samples'
      ? 'w-1/2'
      : tabValue === 'agent'
        ? 'w-1/3'
        : 'w-[305px]';


  return (
    <Tabs
      value={tabValue}
      onValueChange={(value: string) => setTabValue(value as Tab)}
      className={clsx('flex flex-col h-[calc(100vh-64px)] py-4 border-l transition-width', collapsed ? 'w-[0px]' : renderWidth)}
    >
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TabsList className="grid grid-cols-5 mx-4 mb-6">
            <TabsTrigger value="agent">
              {t('Agent')}
            </TabsTrigger>
            <TabsTrigger value="samples">
              {t('Samples')}
            </TabsTrigger>
            <TabsTrigger value="legend">{t('Legends')}</TabsTrigger>
            <TabsTrigger value="test">{t('Test')}</TabsTrigger>
            <TabsTrigger
              value="edit"
              disabled={editDisabled}
              asChild={editDisabled}
              className={
                clsx({ 'cursor-not-allowed': editDisabled }, '!pointer-events-auto')
              }
            >
              {editDisabled
                ? (
                    <TooltipTrigger>
                      {t('Edit')}
                    </TooltipTrigger>
                  )
                : t('Edit')}
            </TabsTrigger>
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
            <p>{t('You have to select nodes first')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Tabs>
  )
}

export default Editor
