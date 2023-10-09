'use client';
import React, { useEffect, useState } from 'react'
import NavigationBar from '@/modules/navbar'
import Image from 'next/image'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link } from "@nextui-org/react";
import CheckSession from '@/lib/checkSession'
import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabase'


import folder from '@/public/icons/folder.svg'
import arrowR from '@/public/icons/arrow-right.svg'

interface Project {
  name: string;
  description: string;
}

export default function Home() {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const checkUserSession = async () => {
      const session = await CheckSession();
      if (session.session == null) {
        console.log("El usuario no está logueado");
        router.push('/auth')
      } else {
        console.log("El usuario está logueado");
      }
    };
    checkUserSession();
  }, [router]);

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data, error } = await supabaseClient
      .from('proyectos')
      .select('*')
      console.log(data)

    if (error) {
      console.error('Error al obtener proyectos:', error)
    } else {
      setProjects(data)
    }
  }

  const handleSubmitProject = async () => {
    const { data, error } = await supabaseClient
      .from('proyectos')
      .insert([
        { name: projectName, description: projectDescription },
      ])
  
    if (error) {
      console.error('Error al insertar datos:', error)
    } else {
      console.log('Datos insertados:', data)
      onOpenChange()
      location.reload()
    }
  }

  return (

    <main className='w-screen h-screen flex flex-col items-center justify-start'>

      <NavigationBar />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Agregar nuevo proyecto</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nombre de Empresa"
                  variant="bordered"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <Input
                  label="Descripcion"
                  variant="bordered"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" onPress={handleSubmitProject}>
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className='w-full max-w-7xl h-full pt-10 flex flex-col gap-5'>

        <div className='w-full h-auto flex flex-row justify-between items-end px-2'>

          <div className='w-auto h-auto flex flex-col items-start justify-start gap-0'>

            <h2 className='font-bold text-2xl text-[#131315]' style={{ cursor: 'default' }} >Dashboard</h2>

            <span className='font-normal text-base text-[#131315]' style={{ cursor: 'default' }} >Administra tus proyectos</span>

          </div>

          <button onClick={onOpen} className='h-fit w-auto border-x-1 border-t-1 border-b-2 border-[#131315] rounded-lg px-3 py-1.5 gap-1 text-sm font-semibold text-[#131315] hover:bg-[#EF7A17] hover:text-white hover:border-[#D76A0F] ease-in-out duration-200'>
            Agregar Proyecto
          </button>

        </div>

        <div className='w-full h-auto flex flex-row flex-wrap gap-3 justify-between'>

          {projects?.map((project) => (
            <div className='w-full max-w-[305px] h-auto bg-white border-x-1 border-t-1 border-b-2 border-[#E0E0E0] flex flex-col p-5 gap-3 rounded-lg' key={project.name}>

              <div className='flex flex-row gap-1'>

                <Image src={folder} alt='folder' width={20} height={20} />

                <h4 className='font-bold text-black text-base'>{project.name}</h4>

              </div>

              <span className='font-normal text-black text-sm'>{project.description}</span>

              <a href={`/proyecto/${project.name}`} className='w-fit h-auto flex gap-1 hover:gap-2 ease-in-out duration-200'>

                <span className='w-fit font-semibold text-[#EF7A17] text-sm'>Interactuar</span>

                <Image src={arrowR} alt='arrow' width={16} height={16} />

              </a>

            </div>
          ))}

        </div>

      </div>

    </main>

  )
}
