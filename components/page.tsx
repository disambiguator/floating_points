import React, { ReactNode, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Dimensions } from '../lib/types'

const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: black;
  color: white;
`

interface Props {
  children: (dimensions: Dimensions) => ReactNode;
}

export default (props: Props) => {
  const { children } = props
  const [dimensions, setDimensions] = useState<Dimensions | null>(null)

  useEffect(() => {
    if (dimensions == null) {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
  })

  return (
    <>
      <style global jsx>{`
        body {
          margin: 0;
        }
        canvas {
          display: block;
        }
      `}</style>
      <Container id="container">
        {dimensions ? children(dimensions) : null}
      </Container>
    </>
  )
}
