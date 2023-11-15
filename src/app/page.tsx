'use client';
import React, { useEffect, useState } from 'react'
import NavigationBar from '@/modules/navbar'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Divider, AvatarGroup, Avatar, Progress } from "@nextui-org/react";
import CheckSession from '@/lib/checkSession'
import { useRouter } from 'next/navigation';
import supabaseClient from '@/lib/supabase'

import { IconLayoutGridAdd, IconProgressBolt, IconPlayerPause, IconDiscountCheck, IconDotsVertical, IconUser, IconFileTypePdf, IconUsersGroup, IconColumns } from '@tabler/icons-react'

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

      <div className='w-full max-w-7xl h-full pt-6 flex flex-col gap-8'>

        <div className='w-full h-14 flex flex-row items-end justify-between cursor-default'>

          <div className='w-auto h-full flex flex-col gap-0'>

            <span className=' text-base font-normal text-[#A1A1A1]'>Bienvenido de vuelta Karlo Aldrete</span>

            <h4 className=' text-2xl font-bold text-[#1F1F21]'>Administrador de proyectos</h4>

          </div>

          <Button className='w-auto h-8 px-3 bg-white text-base font-bold text-[#1F1F21] rounded-md border-2 border-[#1F1F21] hover:bg-[#1F1F21] hover:text-[#E7E7E8]'>Añadir proyecto</Button>

        </div>

        <div className='w-full h-full grid grid-cols-4 gap-5'>

          <div className='flex flex-col items-start justify-start gap-2'>

            <div className='w-full max-h-9 h-full flex flex-row items-center justify-start gap-2 cursor-default p-2'>

              <IconLayoutGridAdd size={20} className='text-[#1F1F21]' />

              <span className=' text-base font-bold text-[#1F1F21]'>Nuevos</span>

            </div>

            <div className='w-full h-full flex flex-col items-start justify-start gap-2 overflow-y-auto' style={{ maxHeight: 'calc(100vh - 256px)' }}>

              <div className='w-full border-x-1 border-t-1 border-b-2 border-[#89898A] flex flex-col items-start justify-start p-4 gap-4 rounded-lg bg-white'>

                <div className='w-full flex flex-col items-center justify-start gap-2 cursor-default'>

                  <div className='w-full h-[18px] flex flex-row items-center justify-between'>

                    <div className='w-auto h-full flex flex-row gap-1 cursor-default'>

                      <IconUser size={18} className='text-[#89898A] stroke-[3]' />

                      <span className=' text-sm font-semibold text-[#89898A]'>Profundidad</span>

                    </div>

                    <IconDotsVertical size={18} className='text-[#89898A] cursor-pointer hover:text-[#1F1F21]' />

                  </div>

                  <div className='w-full h-auto'>

                    <span className='descriptions'>Empresa de productos defectuosos encabezada por Jennifer Lozoya.</span>

                  </div>

                </div>

                <Divider className='h-[1px] bg-[#89898A]'></Divider>

                <div className='w-full h-8 flex flex-row items-end justify-between'>

                  <div className='w-auto h-full'>

                    <AvatarGroup isBordered color={undefined}>

                      <Avatar src='https://i.pravatar.cc/150?u=a042581f4e29026024d' size='sm' />
                      <Avatar src='https://i.pravatar.cc/150?u=a042581f4e29026024d' size='sm' />

                    </AvatarGroup>

                  </div>

                  <div className='w-auto h-auto'>

                    <div className='w-auto h-auto flex flex-row gap-1 items-center justify-end'>

                      <IconFileTypePdf size={24} className='text-[#1F1F21]' />

                      <span className='text-sm font-bold text-[#1F1F21]'>0 Docs</span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className='flex flex-col items-start justify-start gap-2'>

            <div className='w-full min-h-9 max-h-9 flex flex-row items-center justify-start gap-2 cursor-default p-2'>

              <IconProgressBolt size={20} className='text-[#1F1F21]' />

              <span className=' text-base font-bold text-[#1F1F21]'>En Proceso</span>

            </div>

            <div className='w-full h-full overflow-y-auto gap-2 flex flex-col' style={{ maxHeight: 'calc(100vh - 256px)'}}>

              <div className='w-full border-x-1 border-t-1 border-b-2 border-[#89898A] flex flex-col items-start justify-start p-4 gap-4 rounded-lg bg-white'>

                <div className='w-full flex flex-col items-center justify-start gap-2 cursor-default'>

                  <div className='w-full h-[18px] flex flex-row items-center justify-between'>

                    <div className='w-auto h-full flex flex-row gap-1 cursor-default'>

                      <IconUsersGroup size={18} className='text-[#89898A] stroke-[3]' />

                      <span className=' text-sm font-semibold text-[#89898A]'>Grupal</span>

                    </div>

                    <IconDotsVertical size={18} className='text-[#89898A] cursor-pointer hover:text-[#1F1F21]' />

                  </div>

                  <div className='w-full h-auto'>

                    <span className='descriptions'>Empresa de productos defectuosos encabezada por Jennifer Lozoya.</span>

                  </div>

                </div>

                <div className='w-full'>

                  <Progress aria-label='progress' label='6 / 12 Entrevistados' value={50} color='primary' className='progress' />

                </div>

                <Divider className='h-[1px] bg-[#89898A]'></Divider>

                <div className='w-full h-8 flex flex-row items-end justify-between'>

                  <div className='w-auto h-full'>

                    <AvatarGroup isBordered color={undefined}>

                      <Avatar src='https://i.pravatar.cc/150?u=a042581f4e29026024d' size='sm' />
                      <Avatar src='https://i.pravatar.cc/150?u=a042581f4e29026024d' size='sm' />

                    </AvatarGroup>

                  </div>

                  <div className='w-auto h-auto flex flex-row items-center justify-end gap-4'>

                    <div className='w-auto h-auto flex flex-row gap-1 items-center justify-end'>

                      <IconFileTypePdf size={24} className='text-[#1F1F21]' />

                      <span className='text-sm font-bold text-[#1F1F21]'>8 Docs</span>

                    </div>

                    <div className='w-auto h-auto flex flex-row gap-1 items-center justify-end'>

                      <IconColumns size={24} className='text-[#1F1F21]' />

                      <span className='text-sm font-bold text-[#1F1F21]'>Tabla</span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className='flex flex-col items-start justify-start gap-2'>

            <div className='w-full min-h-9 max-h-9 flex flex-row items-center justify-start gap-2 cursor-default p-2'>

              <IconPlayerPause size={20} className='text-[#1F1F21]' />

              <span className=' text-base font-bold text-[#1F1F21]'>Pausados</span>

            </div>

            <div className='w-full h-full'>

              <div className='w-full h-auto border-x-1 border-t-1 border-b-2 border-[#89898A] flex flex-col items-start justify-start p-4 gap-4 rounded-lg bg-white'></div>

            </div>

          </div>

          <div className='flex flex-col items-start justify-start gap-2'>

            <div className='w-full min-h-9 max-h-9 flex flex-row items-center justify-start gap-2 cursor-default p-2'>

              <IconDiscountCheck size={20} className='text-[#1F1F21]' />

              <span className=' text-base font-bold text-[#1F1F21]'>Finalizados</span>

            </div>

            <div className='w-full h-full'>

              <div className='w-full h-auto border-x-1 border-t-1 border-b-2 border-[#89898A] flex flex-col items-start justify-start p-4 gap-4 rounded-lg bg-white'></div>

            </div>

          </div>

        </div>

      </div>

    </main>

  )
}
