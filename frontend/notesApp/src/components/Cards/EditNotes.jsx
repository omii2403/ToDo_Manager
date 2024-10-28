import React, { useState } from 'react'
import { MdClose } from 'react-icons/md'
import axiosInstance from '../../utils/axiosInstance'

function EditNotes({type, noteData, handleClose, getAllNotes}) {
    const [title, setTitle] = useState()
    const [content, setContent] = useState()

    const addNewNote = async() => {
      try{
        const response = await axiosInstance.post('add-note', {
          title, 
          content
        }).then( () => {
          getAllNotes()
          handleClose()
        })

      }
      catch(error){
        console.log(error);
      }
    }

    const editNotes = async() => {
      try{
        const response = await axiosInstance.put('edit-note/'+noteData._id, {
          title, 
          content
        })

        if(response.data && response.data.note){
          getAllNotes()
          handleClose()
        }
      }
      catch(error){
        console.log(error);
      }
    }

    return (
    <div className='relative'>
      <button onClick={handleClose} className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 right-3 hover:bg-slate-50'>
        <MdClose className='text-xl text-slate-400'/>
      </button>
      <div className='flex flex-col gap-2'>
        <label className='input-label'>Title</label>
        <input type='text' onChange = { (e) => setTitle(e.target.value) } className='text-xl bg-slate-100 outline-none' required/>
      </div>
      <div className='flex flex-col gap-2 mt-4'>
        <label className='input-label'>Content</label>
        <textarea type='text' onChange = { (e) => setContent(e.target.value) } className='text-2xl bg-slate-100 p-2 rounded' rows={10} required/>
      </div>
      
      <button className='w-[100%] bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mt-5 p-3' onClick={type=="add"?addNewNote:editNotes}>
        {type=="add"?"ADD":"UPDATE"}
      </button>
      
    </div>
  )
}

export default EditNotes
