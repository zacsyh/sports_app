import React from 'react';
import styled from 'styled-components';

const Card = ({ children, onClick }) => {
  return (
    <StyledWrapper>
      <div className="card" onClick={onClick}>
        <div className="card-content">
          <div className="card-top">
            <span className="card-title">01.</span>
            <p>Lightning.</p>
          </div>
          <div className="card-bottom">
            <p>Hover Me?</p>
            <svg width={32} viewBox="0 -960 960 960" height={32} xmlns="http://www.w3.org/2000/svg"><path d="M226-160q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19ZM226-414q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19ZM226-668q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Zm254 0q-28 0-47-19t-19-47q0-28 19-47t47-19q28 0 47 19t19 47q0 28-19 47t-47 19Z" /></svg>
          </div>
        </div>
        <div className="card-image">
          <svg width={48} viewBox="0 -960 960 960" height={48} xmlns="http://www.w3.org/2000/svg"><path d="m393-165 279-335H492l36-286-253 366h154l-36 255Zm-73 85 40-280H160l360-520h80l-40 320h240L400-80h-80Zm153-395Z" /></svg>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 320px;
    background: #fff480;
    color: black;
    position: relative;
    border-radius: 2.5em;
    padding: 2em;
    transition: transform 0.4s ease;
  }

  .card .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 5em;
    height: 100%;
    transition: transform 0.4s ease;
  }

  .card .card-top, .card .card-bottom {
    display: flex;
    justify-content: space-between;
  }

  .card .card-top p, .card .card-top .card-title, .card .card-bottom p, .card .card-bottom .card-title {
    margin: 0;
  }

  .card .card-title {
    font-weight: bold;
  }

  .card .card-top p, .card .card-bottom p {
    font-weight: 600;
  }

  .card .card-bottom {
    align-items: flex-end;
  }

  .card .card-image {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  .card .card-image svg {
    width: 4em;
    height: 4em;
    transition: transform 0.4s ease;
  }

  .card:hover {
    cursor: pointer;
    transform: scale(0.97);
  }

  .card:hover .card-content {
    transform: scale(0.96);
  }

  .card:hover .card-image svg {
    transform: scale(1.05);
  }

  .card:active {
    transform: scale(0.9);
  }
`;

export default Card;