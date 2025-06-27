import React, { useState } from 'react';

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares: string[]) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(''));
  const [xIsNext, setXIsNext] = useState(true);

  const winnerObj = calculateWinner(squares);
  const winner = winnerObj?.winner;
  const winningLine = winnerObj?.line || [];
  const isDraw = !winner && squares.every(Boolean);

  function handleClick(index: number) {
    if (winner || squares[index]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[index] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  function restartGame() {
    setSquares(Array(9).fill(''));
    setXIsNext(true);
  }

  return (
    <div className='container mx-auto py-16 px-8 max-w-md'>
      <h1 className='text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-lg tracking-tight'>
        <span className='inline-block align-middle mr-2'>🎮</span>Tic Tac Toe
      </h1>
      <div className='flex justify-center'>
        <div className='bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-blue-400 rounded-2xl shadow-2xl p-6'>
          <div className='grid grid-cols-3 gap-3'>
            {squares.map((square, i) => {
              const isWinning = winningLine.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`w-24 h-24 flex items-center justify-center text-5xl font-extrabold rounded-xl border-2 transition-all duration-150
                    ${square === 'X' ? 'text-blue-600' : square === 'O' ? 'text-pink-500' : 'text-gray-400'}
                    ${isWinning ? 'bg-yellow-200 border-yellow-400 animate-pulse' : 'bg-white border-gray-300'}
                    ${!square && !winner ? 'hover:bg-blue-50 hover:scale-105 cursor-pointer' : 'cursor-default'}
                    shadow-md`}
                  aria-label={`Square ${i + 1}`}
                  style={{
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                  disabled={!!square || !!winner}
                >
                  <span
                    className='transition-transform duration-200'
                    style={{
                      transform: square ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {square}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className='mt-8 text-center text-lg min-h-[2.5rem]'>
        {winner ? (
          <p className='text-green-600 font-semibold text-2xl flex items-center justify-center gap-2'>
            <span className='text-3xl'>🏆</span> Winner:{' '}
            <span className='drop-shadow'>{winner}</span>
          </p>
        ) : isDraw ? (
          <p className='text-yellow-600 font-semibold text-2xl flex items-center justify-center gap-2'>
            <span className='text-2xl'>🤝</span> It&apos;s a draw!
          </p>
        ) : (
          <p className='text-blue-700 font-medium text-xl flex items-center justify-center gap-2'>
            <span className='text-xl'>{xIsNext ? '❌' : '⭕'}</span> Next
            player: <span className='drop-shadow'>{xIsNext ? 'X' : 'O'}</span>
          </p>
        )}
      </div>
      <div className='mt-8 text-center'>
        <button
          onClick={restartGame}
          className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all text-lg'
        >
          🔄 Restart Game
        </button>
      </div>
    </div>
  );
}
