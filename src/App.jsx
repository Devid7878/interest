import { useState, useEffect } from 'react';
import './App.css';
import { differenceInCalendarDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function App() {
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [amount, setAmount] = useState('');
	const [interestRate, setInterestRate] = useState('');
	const [days, setDays] = useState('');
	const [calculatedInterest, setCalculatedInterest] = useState('');
	const [history, setHistory] = useState([]);

	const getDate = (date) => {
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	useEffect(() => {
		setEndDate(getDate(new Date()));
		const savedHistory = localStorage.getItem('interestHistory');
		if (savedHistory) {
			setHistory(JSON.parse(savedHistory));
		}
	}, []);

	const calcDays = () => {
		if (!startDate || !endDate) return;
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diff = differenceInCalendarDays(end, start) + 1;
		setDays(diff > 0 ? diff : 0);
	};

	const calcInterest = () => {
		if (amount && interestRate && days) {
			const interest = (((amount * interestRate) / 100) * days) / 365;
			setCalculatedInterest(interest.toFixed(2));
		}
	};

	const addToHistory = () => {
		if (!amount || !interestRate || !startDate || !endDate) {
			alert('Please enter all the details!');
			return; // Don't add to history if required details are missing
		}

		const formattedStart = format(new Date(startDate), 'dd/MM/yyyy');
		const formattedEnd = format(new Date(endDate), 'dd/MM/yyyy');

		const newEntry = {
			Amount: amount,
			'Interest Rate': interestRate,
			'Start Date': formattedStart,
			'End Date': formattedEnd,
			'No of Days': days,
			'Calculated Interest': calculatedInterest,
		};

		const updatedHistory = [...history, newEntry];
		setHistory(updatedHistory);
	};

	const handleCalculate = () => {
		setDays("")
		setCalculatedInterest("")
		setAmount("");
		setStartDate("")
		addToHistory();
	};

	useEffect(() => {
		calcDays();
	}, [startDate, endDate]);

	useEffect(() => {
		calcInterest();
	}, [amount, interestRate, days]);

	// useEffect to save history to localStorage when history changes
	useEffect(() => {
		if (history.length > 0) {
			localStorage.setItem('interestHistory', JSON.stringify(history));
		}
	}, [history]);

	const exportToExcel = () => {
		const ws = XLSX.utils.json_to_sheet(history);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Interest History');
		const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
		saveAs(data, 'interest-history.xlsx');
	};

	const handleReset = () => {
		setAmount("");
		setCalculatedInterest("");
		setDays("");
		setEndDate("");
		setStartDate("");
		setHistory([]); 
		localStorage.setItem("interestHistory", JSON.stringify([]));
	};
	

	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center p-6'>
			<div className='bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 space-y-6 print:p-4 print:shadow-none'>
				<h1 className='text-2xl font-semibold text-gray-800 text-center'>
					Interest Calculator
				</h1>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					<div className='bg-gray-50 rounded-xl p-6 shadow-sm'>
						<h2 className='text-lg font-medium mb-4'>Financial Info</h2>
						<div className='space-y-4'>
							<div>
								<label
									htmlFor='amount'
									className='block text-sm font-medium text-gray-700'>
									Amount
								</label>
								<input
									type='number'
									id='amount'
									className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md'
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor='interest_rate'
									className='block text-sm font-medium text-gray-700'>
									Interest Rate (%)
								</label>
								<input
									type='number'
									id='interest_rate'
									className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md'
									value={interestRate}
									onChange={(e) => setInterestRate(e.target.value)}
								/>
							</div>
						</div>
					</div>

					<div className='bg-gray-50 rounded-xl p-6 shadow-sm'>
						<h2 className='text-lg font-medium mb-4'>Date Info</h2>
						<div className='space-y-4'>
							<div>
								<label
									htmlFor='start_date'
									className='block text-sm font-medium text-gray-700'>
									Start Date
								</label>
								<input
									type='date'
									id='start_date'
									className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md'
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor='end_date'
									className='block text-sm font-medium text-gray-700'>
									End Date
								</label>
								<input
									type='date'
									id='end_date'
									className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md'
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Results */}
				<div className='bg-gray-50 rounded-xl p-6 shadow-sm space-y-4'>
					<div className='text-sm text-gray-700'>
						Number of Days: <strong>{days} {days.length && "days"}</strong>
					</div>
					<div className='text-sm text-gray-700'>
						Calculated Interest: <strong>₹{calculatedInterest}</strong>
					</div>
					<button
						onClick={handleCalculate}
						className=' bg-slate-900 text-white px-6 py-2 rounded-md hover:bg-green-600'>
						Calculate & Save
					</button>
				</div>

				{/* Buttons */}
				<div className='flex gap-4 justify-center print:hidden'>
					<button
						onClick={exportToExcel}
						className='bg-green-900 text-white px-6 py-2 rounded-md hover:bg-blue-600'>
						Export to Excel
					</button>
					<button
						onClick={handleReset}
						className='bg-red-900 text-white px-6 py-2 rounded-md hover:bg-blue-600'>
						Reset
					</button>
				</div>
			</div>
		</div>
	);
}

export default App;
