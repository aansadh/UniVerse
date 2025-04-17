import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "@/lib/axios";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

function SettingsAccount() {
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleClick = () => {setDeleteDialogOpen(true)};
  const handleChange = () => {};
  const handleDelete = () => {
    axios.get('')
  }

  return (
    <div className="flex-1">
      <div className="absolute top-3 right-3">
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
      </ div>

      <Card className="p-4 mx-20 space-y-4">
        <CardHeader>
          <CardTitle className="text-center text-bold text-xl">
            Delete Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="scroll-m-20 text-xl tracking-tight text-center">
            Are you sure you want to delete account?
            <br />
            Once you start, there is no going back.
          </h4>
          <div className="flex justify-center py-4">
            <Button variant='destructive' type='button' onClick={handleClick}  disabled={loading}>
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </ div>
  );
}

export default SettingsAccount;
