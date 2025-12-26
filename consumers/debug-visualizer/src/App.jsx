import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000'

function App() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const entitiesRef = useRef(new Map())
  const velocityLinesRef = useRef(new Map())
  const [status, setStatus] = useState('Connecting...')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 10, 20)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x333333)
    scene.add(gridHelper)

    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)

    let eventSource = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const safeToFixed = (value, decimals = 2) => {
      const num = typeof value === 'number' ? value : parseFloat(value) || 0
      if (isNaN(num) || !isFinite(num)) return '0.00'
      return num.toFixed(decimals)
    }

    const validateNumber = (value, defaultValue = 0) => {
      const num = typeof value === 'number' ? value : parseFloat(value)
      return (isNaN(num) || !isFinite(num)) ? defaultValue : num
    }

    const connectStream = () => {
      if (eventSource) {
        eventSource.close()
      }
      
      setStatus('Connecting to simulation...')
      eventSource = new EventSource(`${GATEWAY_URL}/api/sim/stream`)

      eventSource.onmessage = (event) => {
      if (!event || !event.data) {
        console.warn('EventSource: received message with no data')
        return
      }

      let delta
      try {
        delta = JSON.parse(event.data)
      } catch (err) {
        console.warn('EventSource: failed to parse JSON', err)
        return
      }

      if (!delta || typeof delta !== 'object') {
        console.warn('EventSource: invalid delta object')
        return
      }

      const metadata = delta.metadata || {}
      const tick = validateNumber(metadata.tick, 0)
      const simTime = validateNumber(metadata.simTime || metadata.sim_time, 0)
      const deltaTime = validateNumber(metadata.deltaTime || metadata.delta_time, 0)
      
      setTick(tick)
      setStatus(`Tick: ${tick} | Time: ${safeToFixed(simTime, 2)}s | dt: ${safeToFixed(deltaTime, 4)}s`)

      if (Array.isArray(delta.created)) {
        for (const entity of delta.created) {
          if (!entity || !entity.id) continue
          
          let mesh = entitiesRef.current.get(entity.id)
          if (!mesh) {
            const radius = validateNumber(entity.shape?.size?.x, 1.0)
            const geometry = new THREE.SphereGeometry(radius, 16, 16)
            const material = new THREE.MeshBasicMaterial({ 
              color: 0x00ff00, 
              wireframe: true 
            })
            mesh = new THREE.Mesh(geometry, material)
            scene.add(mesh)
            entitiesRef.current.set(entity.id, mesh)
          }

          if (entity.transform?.position) {
            const pos = entity.transform.position
            mesh.position.set(
              validateNumber(pos.x, 0),
              validateNumber(pos.y, 0),
              validateNumber(pos.z, 0)
            )
          }

          if (entity.physics?.linearVelocity || entity.physics?.linear_velocity) {
            const vel = entity.physics.linearVelocity || entity.physics.linear_velocity || {}
            const vx = validateNumber(vel.x, 0)
            const vy = validateNumber(vel.y, 0)
            const vz = validateNumber(vel.z, 0)
            const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
            
            if (speed > 0.01) {
              let velLine = velocityLinesRef.current.get(entity.id)
              if (!velLine) {
                const geometry = new THREE.BufferGeometry()
                const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
                velLine = new THREE.Line(geometry, material)
                scene.add(velLine)
                velocityLinesRef.current.set(entity.id, velLine)
              }
              
              const scale = 0.5
              const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(vx * scale, vy * scale, vz * scale)
              ]
              velLine.geometry.setFromPoints(points)
              velLine.position.copy(mesh.position)
            }
          }
        }
      }

      if (Array.isArray(delta.updated)) {
        for (const entity of delta.updated) {
          if (!entity || !entity.id) continue
          
          let mesh = entitiesRef.current.get(entity.id)
          
          if (!mesh) {
            const radius = validateNumber(entity.shape?.size?.x, 1.0)
            const geometry = new THREE.SphereGeometry(radius, 16, 16)
            const material = new THREE.MeshBasicMaterial({ 
              color: 0x00ff00, 
              wireframe: true 
            })
            mesh = new THREE.Mesh(geometry, material)
            scene.add(mesh)
            entitiesRef.current.set(entity.id, mesh)
          }

          if (entity.transform?.position) {
            const pos = entity.transform.position
            mesh.position.set(
              validateNumber(pos.x, 0),
              validateNumber(pos.y, 0),
              validateNumber(pos.z, 0)
            )
          }

          if (entity.physics?.linearVelocity || entity.physics?.linear_velocity) {
            const vel = entity.physics.linearVelocity || entity.physics.linear_velocity || {}
            const vx = validateNumber(vel.x, 0)
            const vy = validateNumber(vel.y, 0)
            const vz = validateNumber(vel.z, 0)
            const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
            
            if (speed > 0.01) {
              let velLine = velocityLinesRef.current.get(entity.id)
              if (!velLine) {
                const geometry = new THREE.BufferGeometry()
                const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
                velLine = new THREE.Line(geometry, material)
                scene.add(velLine)
                velocityLinesRef.current.set(entity.id, velLine)
              }
              
              const scale = 0.5
              const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(vx * scale, vy * scale, vz * scale)
              ]
              velLine.geometry.setFromPoints(points)
              velLine.position.copy(mesh.position)
            } else {
              const velLine = velocityLinesRef.current.get(entity.id)
              if (velLine) {
                scene.remove(velLine)
                velLine.geometry.dispose()
                velLine.material.dispose()
                velocityLinesRef.current.delete(entity.id)
              }
            }
          }
        }
      }

      if (Array.isArray(delta.removed)) {
        for (const id of delta.removed) {
          if (!id) continue
          const mesh = entitiesRef.current.get(id)
          if (mesh) {
            scene.remove(mesh)
            mesh.geometry.dispose()
            mesh.material.dispose()
            entitiesRef.current.delete(id)
          }
          const velLine = velocityLinesRef.current.get(id)
          if (velLine) {
            scene.remove(velLine)
            velLine.geometry.dispose()
            velLine.material.dispose()
            velocityLinesRef.current.delete(id)
          }
        }
      }
    }

      eventSource.onopen = () => {
        reconnectAttempts = 0
        setStatus('Connected - waiting for data...')
      }

      eventSource.onerror = (err) => {
        console.warn('EventSource: connection error', err)
        reconnectAttempts++
        if (reconnectAttempts < maxReconnectAttempts) {
          setStatus(`Connection error - retrying (${reconnectAttempts}/${maxReconnectAttempts})...`)
          setTimeout(() => {
            connectStream()
          }, 2000)
        } else {
          setStatus('Connection failed - please check if simulation is running')
        }
      }
    }

    connectStream()

    const animate = () => {
      requestAnimationFrame(animate)
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (eventSource) {
        eventSource.close()
      }
      window.removeEventListener('resize', handleResize)
      
      if (sceneRef.current) {
        for (const [id, velLine] of velocityLinesRef.current) {
          sceneRef.current.remove(velLine)
          velLine.geometry.dispose()
          velLine.material.dispose()
        }
        velocityLinesRef.current.clear()
      }
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#0f0'
      }}>
        <div>{status}</div>
        <div>Entities: {entitiesRef.current.size}</div>
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Δ updates</div>
      </div>
    </div>
  )
}

export default App

