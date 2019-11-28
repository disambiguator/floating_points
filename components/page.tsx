import React, { useEffect, useState } from 'react'
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background: lightgray;
`

export default props => {
  const { children } = props
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null)

  useEffect(() => {
    if (dimensions == null) {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
  })

  return <Container id="container">{children(dimensions)}</Container>
}
