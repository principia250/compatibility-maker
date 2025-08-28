import React from 'react';
import NodeAndEdge from '@/components/NodeAndEdge';
import { NodeAndEdgeProps } from '@/components/NodeAndEdge/type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';

export default function DemoPage() {
  const nodeAndEdgeProps: NodeAndEdgeProps = {
    leftElements: [
      { id: '1', text: 'ＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷ', isVisible: true, displayScore: true, canHide: true, allCompatibilityExsist: true },
      { id: '2', text: 'ＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷＷ', isVisible: false, displayScore: true, canHide: true, allCompatibilityExsist: true },
      { id: '3', text: 'テクニック3', isVisible: true, displayScore: false, canHide: true, allCompatibilityExsist: true },
      { id: '4', text: 'テクニック4', isVisible: true, displayScore: true, canHide: false, allCompatibilityExsist: true },
      { id: '5', text: 'テクニック5', isVisible: true, displayScore: true, canHide: true, allCompatibilityExsist: false },
    ],
    rightElements: [
      { id: '6', text: 'テクニック6', isVisible: false, displayScore: true, canHide: true, allCompatibilityExsist: false },
      { id: '7', text: '遅らせ前歩き投げ', isVisible: true, displayScore: true, canHide: true, allCompatibilityExsist: true },
    ],
    compatibilities: [
      { id: '1', leftElementId: '1', rightElementId: '6', compatibilityScore: 2, reverseCompatibilityScore: 1 },
      { id: '2', leftElementId: '1', rightElementId: '7', compatibilityScore: 1, reverseCompatibilityScore: 1 },
      { id: '3', leftElementId: '2', rightElementId: '6', compatibilityScore: 0, reverseCompatibilityScore: 1 },
      { id: '4', leftElementId: '2', rightElementId: '7', compatibilityScore: -1, reverseCompatibilityScore: 1 },
      { id: '5', leftElementId: '3', rightElementId: '6', compatibilityScore: -2, reverseCompatibilityScore: 1 },
      { id: '6', leftElementId: '3', rightElementId: '7', compatibilityScore: 2, reverseCompatibilityScore: 1 },
    ],
  }
  return (
    <div className="min-h-screen p-8">
      <div className="w-full">
        <div className="flex flex-col gap-2 mb-4">
          <Button className="w-fit">
            Button
          </Button>
          <Button className="w-fit" variant="deactive">
            Button
          </Button>
          <Button className="w-fit" variant="destructive">
            Button
          </Button>
          <Button className="w-fit" variant="positive">
            Button
          </Button>
          <Button className="w-fit" variant="link">
            Button
          </Button>
          <Button size="sm" className="w-fit">
            Button
          </Button>
          <Input placeholder="Input" className="" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Item 1</SelectItem>
              <SelectItem value="2">Item 2</SelectItem>
              <SelectItem value="3">Item 3</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Tabs defaultValue="1">
            <TabsList>
              <TabsTrigger value="1">Item 1</TabsTrigger>
              <TabsTrigger value="2">Item 2</TabsTrigger>
              <TabsTrigger value="3">Item 3</TabsTrigger>
            </TabsList>
            <TabsContent value="1">Item 1</TabsContent>
            <TabsContent value="2">Item 2</TabsContent>
            <TabsContent value="3">Item 3</TabsContent>
          </Tabs>
        </div>
        <h2 className="mb-4 text-xl font-semibold">
          相性図サンプル
        </h2>
        
        <div className="">
          <NodeAndEdge
            {...nodeAndEdgeProps}
          />
        </div>
      </div>
    </div>
  );
}
