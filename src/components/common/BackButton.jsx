import React from 'react';
import styled from 'styled-components';

const BackButton = ({ onClick, text = "返回" }) => {
  return (
    <StyledButton onClick={onClick}>
      <div className="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="25px" width="25px">
          <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="#000000" />
          <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" fill="#000000" />
        </svg>
      </div>
      <span className="button-text">{text}</span>
    </StyledButton>
  );
};

const StyledButton = styled.button`
  background-color: white;
  display: flex;
  align-items: center;
  width: 192px;
  height: 56px;
  border-radius: 16px;
  position: relative;
  color: black;
  font-size: 20px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  overflow: hidden;
  padding: 0;

  .icon-container {
    background-color: #4ade80;
    border-radius: 12px;
    height: 48px;
    width: 25%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 4px;
    top: 4px;
    z-index: 10;
    transition: width 0.5s ease;
  }

  &:hover .icon-container {
    width: 184px;
    border-radius: 16px;
  }

  .button-text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 5;
    font-weight: 600;
    color: black;
    font-size: 20px;
    white-space: nowrap;
    pointer-events: none;
    transition: color 0.5s ease;
  }

  &:hover .button-text {
    color: white;
  }

  &:hover svg path {
    fill: white;
  }
`;

export default BackButton;