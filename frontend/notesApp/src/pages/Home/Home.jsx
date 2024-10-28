import React, {useState} from 'react'
import Navbar from '../../components/Navbar'
import NoteCard from '../../components/Cards/NoteCard'
import { MdAdd, MdOnDeviceTraining } from 'react-icons/md'
import EditNotes from '../../components/Cards/EditNotes'
import Modal from "react-modal"
import axios from "axios"
import { useEffect } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { useNavigate } from 'react-router-dom'

function Home() {

  const navigate = useNavigate()
  const [openEditNote, setOpenEditNote] = useState(
    {
      isShown: false, 
      type: "add", 
      data: null,
    }
  )

  const [userInfo, setUserInfo] = useState(null)

  const getUserInfo = async() => {
    try{
      const response = await axiosInstance.post('/get-user');

      // console.log(response.data.user)
      if(response.data && response.data.user){
        setUserInfo(response.data.user)
      }
    }
    catch(error){
      if(error.response.status === 401){
        localStorage.clear();
        navigate('/login')
      }
    }
  }
  
  const[notesData, setNotesData] = useState()

  const getAllNotes = async() => {
    try{
      const response = await axiosInstance.post('/all-notes')
      // console.log(response.data)
      if(response.data && response.data.notes){
        // console.log(response.data)
        setNotesData(response.data.notes)
      }
    }
    catch(error){
      console.log("An unexpected error occurred. Please try again!")
    }
  }

  const handleEdit = (noteData) => {
    // console.log("Hello", noteData)
    setOpenEditNote({
      isShown: true, 
      data: noteData,
      type: "edit"
    })
  }

  const handleDelete = async(noteData) => {
    try{
      await axiosInstance.post('/delete-note/'+noteData._id).then( () => {
        getAllNotes();
      })
    }
    catch(err){
      console.log(err)
    }
  }

  const handlePin = async(noteData) => {
    try{
      // console.log(noteData.isPinned)
      await axiosInstance.post('/update-pinned-note/'+noteData._id, {isPinned: noteData.isPinned}).then( (resp) => {
        // console.log(resp.data.message)
        // console.log(noteData.isPinned)
        getAllNotes()
      })
    }
    catch(err){
      console.log(err)
    }
  }
  const [data, setData] = useState()
  useEffect( () => {
    getAllNotes();
    getUserInfo();
    
  }, [])
  return (
    <div>
      
      <Navbar/>
      <div className='container mx-auto my-auto'>
        <div className='grid grid-cols-3 gap-4 mt-8'>
        {

          notesData?.map( (item) => {
            return <NoteCard 
            key={item._id}
            title={item.title}
            date={item.createdOn} 
            content={item.content} 
            isPinned={item.isPinned}
            onEdit={()=> handleEdit(item)}
            onDelete={()=>handleDelete(item)}
            onPin={()=>handlePin(item)}
          />
            }
          )
        }
          
          
        </div>
      </div>

      <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-800 absolute right-10 bottom-10' 
        onClick={() => {
          setOpenEditNote(
            {
              isShown: true,
              type: "add",
              data: null
            }
          )
        }}>
        <MdAdd className='text-[32px] text-white'/>
      </button>

      <Modal 
        isOpen = {openEditNote.isShown}
        onRequestClose = {() => {}}
        style={
          {
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.2"
            },
          }
        }
        contentLabel=''
        className='w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll'
        >
          <EditNotes 
            type={openEditNote.type}
            noteData = {openEditNote.data}
            handleClose={
              () => {
                setOpenEditNote({
                  isShown: false, 
                  type: "add", 
                  data: null,
                })
              }
            }
            getAllNotes={getAllNotes}
          />
        </Modal>
    </div>
  )
}

export default Home
