"use client"
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Plus, Camera, Edit, Trash2 } from "lucide-react";
import { firestore, storage } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactCamera from "@/components/ReactCamera";
import { useToast } from "@/components/ui/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  count: number;
  image?: string;
  addMethod: 'Manual' | 'Camera';
}

const ListComponent: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [modalItem, setModalItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (item: InventoryItem | null = null) => {
    setModalItem(item || { id: '', name: '', count: 0, addMethod: 'Manual' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalItem(null);
    setImageFile(null);
    setIsModalOpen(false);
  };

  const handleOpenCameraModal = () => {
    setIsCameraModalOpen(true);
  };

  const handleCloseCameraModal = () => {
    setIsCameraModalOpen(false);
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(firestore, "fruits"));
      const itemList = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.id,
        count: doc.data().count,
        image: doc.data().image || '/images/placeholder.png',
        addMethod: doc.data().addMethod || 'Manual'
      }));
      setItems(itemList);
    } catch (err) {
      console.error("Error fetching fruits:", err);
      toast({
        title: "Error",
        description: "Failed to fetch items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalItem) return;

    try {
      const { id, name, count, addMethod } = modalItem;
      if (!name.trim() || count < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid name and count.",
          variant: "destructive",
        });
        return;
      }

      const docRef = doc(collection(firestore, "fruits"), name);
      
      let imageUrl = modalItem.image;

      if (imageFile) {
        const storageRef = ref(storage, `images/${name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const itemData: { count: number; addMethod: string; image?: string } = {
        count,
        addMethod
      };

      if (imageUrl) {
        itemData.image = imageUrl;
      }

      if (id) {
        if (id !== name) {
          const oldDocRef = doc(collection(firestore, "fruits"), id);
          const newDocSnap = await getDoc(docRef);
          
          if (newDocSnap.exists()) {
            const newCount = newDocSnap.data().count + count;
            await updateDoc(docRef, { ...itemData, count: newCount });
          } else {
            await setDoc(docRef, itemData);
          }
          
          await deleteDoc(oldDocRef);
        } else {
          await updateDoc(docRef, itemData);
        }
        toast({
          title: "Success",
          description: "Item updated successfully!",
        });
      } else {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, { ...itemData, count: docSnap.data().count + count });
        } else {
          await setDoc(docRef, itemData);
        }
        toast({
          title: "Success",
          description: "Item added successfully!",
        });
      }

      await fetchItems();
      handleCloseModal();
    } catch (err) {
      console.error("Error submitting item:", err);
      toast({
        title: "Error",
        description: "Failed to submit item. Please try again later.",
        variant: "destructive",
      });
    }
  }

  const handleDelete = async (item: InventoryItem) => {
    setDeleteConfirmation(item);
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteDoc(doc(collection(firestore, "fruits"), deleteConfirmation.id));
      await fetchItems();
      toast({
        title: "Success",
        description: "Item deleted successfully!",
      });
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmation(null);
    }
  }

  const handleCapture = async (image: string) => {
    const newItem: InventoryItem = {
      id: `Item-${Date.now()}`,
      name: `Scanned Item ${Date.now()}`,
      count: 1,
      image: image,
      addMethod: 'Camera'
    };

    try {
      await setDoc(doc(collection(firestore, "fruits"), newItem.id), {
        count: newItem.count,
        image: newItem.image,
        addMethod: newItem.addMethod
      });
      await fetchItems();
      toast({
        title: "Success",
        description: "Item added successfully from camera!",
      });
      handleCloseCameraModal();
    } catch (err) {
      console.error("Error adding scanned item:", err);
      toast({
        title: "Error",
        description: "Failed to add scanned item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full">
          <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-2"
            />
            <Button onClick={() => handleOpenModal()} className="mr-2">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <Button onClick={handleOpenCameraModal} variant="secondary">
              <Camera className="mr-2 h-4 w-4" /> Add with Camera
            </Button>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500">
              {filteredItems.length} Search result{filteredItems.length !== 1 ? 's' : ''} found.
            </p>
          )}
        </div>
        <h2 className="text-3xl font-bold">Inventory</h2>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Add Method</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <img src={item.image || '/images/placeholder.png'} alt={item.name} className="w-12 h-12 rounded-full object-cover" />
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell>{item.addMethod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mt-4 text-right">
          <p className="text-4xl font-bold">{items.length}</p>
          <p className="text-sm text-gray-500">Items in inventory</p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalItem?.id ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Item name</Label>
              <Input
                id="name"
                value={modalItem?.name || ''}
                onChange={(e) => setModalItem(prev => prev ? {...prev, name: e.target.value} : null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="count">Quantity</Label>
              <Input
                id="count"
                type="number"
                value={modalItem?.count || ''}
                onChange={(e) => setModalItem(prev => prev ? {...prev, count: Number(e.target.value)} : null)}
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setImageFile(files[0]);
                  }
                }}
              />
            </div>
            {(imageFile || modalItem?.image) && (
              <div className="flex items-center justify-between">
                <p className="text-sm">{imageFile ? imageFile.name : 'Current image'}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImageFile(null);
                    setModalItem(prev => prev ? {...prev, image: undefined} : null);
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
            <Button type="submit" className="w-full">
              {modalItem?.id ? 'Save Changes' : 'Add Item'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCameraModalOpen} onOpenChange={setIsCameraModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Item</DialogTitle>
          </DialogHeader>
          <ReactCamera onCapture={handleCapture} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {deleteConfirmation?.name}?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListComponent;