import { useState, useEffect } from 'react';
import './App.css';
import { differenceInCalendarDays, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './i18n';
import { useTranslation } from 'react-i18next';

function App() {
	const [name, setName] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [amount, setAmount] = useState('');
	const [interestRate, setInterestRate] = useState('');
	const [days, setDays] = useState('');
	const [calculatedInterest, setCalculatedInterest] = useState('');
	const [history, setHistory] = useState([]);

	const { t, i18n } = useTranslation();

	const getDate = (date) => {
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	};

	useEffect(() => {
		setEndDate(getDate(new Date()));
	  localStorage.setItem('interestHistory', JSON.stringify([]));
	  setHistory([]);
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
		if (!name || !amount || !interestRate || !startDate || !endDate) {
		alert(t('alertFillAll'));
		return;
	}

	  const formattedStart = format(new Date(startDate), 'dd/MM/yyyy');
	  const formattedEnd = format(new Date(endDate), 'dd/MM/yyyy');

	  const newEntry = {
		[t('name')]: name,
		[t('amount')]: amount,
		[t('interestRate')]: interestRate,
		[t('startDate')]: formattedStart,
		[t('endDate')]: formattedEnd,
		[t('numDays')]: days,
		[t('calcInterest')]: calculatedInterest,
	};

	  const updatedHistory = [...history, newEntry];
	  setHistory(updatedHistory);
  };

	const handleCalculate = () => {
		addToHistory();
		setAmount('');
		setStartDate('');
		setDays('');
		setCalculatedInterest('');
	};

	useEffect(() => {
		calcDays();
	}, [startDate, endDate]);

	useEffect(() => {
		calcInterest();
	}, [amount, interestRate, days]);

	useEffect(() => {
		if (history.length > 0) {
			localStorage.setItem('interestHistory', JSON.stringify(history));
		}
	}, [history]);

	const exportToExcel = () => {
		if (history.length === 0) {
		alert(t('alertNoEntries'));
		return;
	}

	  const wsData = [...history.map(entry => ({ ...entry }))];

	  const totalInterest = history.reduce(
		(sum, entry) => sum + parseFloat(entry[t('calcInterest')]),
		0
	);

	  wsData.push({
		[t('name')]: t('total'),
		[t('amount')]: '',
		[t('interestRate')]: '',
		[t('startDate')]: '',
		[t('endDate')]: '',
		[t('numDays')]: '',
		[t('calcInterest')]: totalInterest.toFixed(2),
	});

	  const ws = XLSX.utils.json_to_sheet(wsData);
	  const wb = XLSX.utils.book_new();
	  XLSX.utils.book_append_sheet(wb, ws, 'Interest History');
	  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
	  const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
	  saveAs(data, 'interest-history.xlsx');
  };

	const handleReset = () => {
		setName('');
		setAmount('');
		setInterestRate('');
		setCalculatedInterest('');
		setDays('');
		setEndDate('');
		setStartDate('');
		setHistory([]);
		localStorage.setItem('interestHistory', JSON.stringify([]));
	};

	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center p-6'>
			<div className='bg-white rounded-2xl shadow-lg w-full max-w-4xl p-8 space-y-6 print:p-4 print:shadow-none'>
			  <div className='flex justify-end gap-2'>
				  <button onClick={() => i18n.changeLanguage('en')} className='px-3 py-1 bg-blue-200 rounded'>EN</button>
				  <button onClick={() => i18n.changeLanguage('gu')} className='px-3 py-1 bg-yellow-200 rounded'>ગુજરાતી</button>
			  </div>

			  <h1 className='text-2xl font-semibold text-gray-800 text-center'>
				  {t('title')}
			  </h1>

			  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				  <div className='bg-gray-50 rounded-xl p-6 shadow-sm'>
					  <h2 className='text-lg font-medium mb-4'>{t('personalInfo')}</h2>
					  <div className='space-y-4'>
						  <div>
							  <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
								  {t('name')}
							  </label>
							  <input
								  type='text'
								  id='name'
								  className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md'
								  value={name}
								  onChange={(e) => setName(e.target.value)}
							  />
						  </div>
						  <div>
							  <label htmlFor='amount' className='block text-sm font-medium text-gray-700'>
								  {t('amount')}
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
							  <label htmlFor='interest_rate' className='block text-sm font-medium text-gray-700'>
								  {t('interestRate')}
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
					  <h2 className='text-lg font-medium mb-4'>{t('dateInfo')}</h2>
					  <div className='space-y-4'>
						  <div>
							  <label htmlFor='start_date' className='block text-sm font-medium text-gray-700'>
								  {t('startDate')}
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
							  <label htmlFor='end_date' className='block text-sm font-medium text-gray-700'>
								  {t('endDate')}
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

			  <div className='bg-gray-200 rounded-xl p-6 shadow-sm space-y-4'>
				  <div className='text-sm text-gray-700'>
					  {t('numDays')}: <strong>{days} {days.length && 'days'}</strong>
				  </div>
				  <div className='text-sm text-gray-700'>
					  {t('calcInterest')}: <strong>₹{calculatedInterest}</strong>
				  </div>
				  <button
					  onClick={handleCalculate}
					  className='bg-slate-800 cursor-pointer text-white px-6 py-2 rounded-md hover:bg-slate-950'>
					  {t('save')}
				  </button>
			  </div>

			  <div className='flex gap-4 justify-center print:hidden'>
				  <button
					  onClick={exportToExcel}
					  className='bg-green-800 cursor-pointer text-white px-3 py-2 rounded-md hover:bg-green-900'>
					  {t('export')}
				  </button>
				  <button
					  onClick={handleReset}
					  className='bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 cursor-pointer'>
					  {t('reset')}
				  </button>
			  </div>
		  </div>
	  </div>
  );
}

export default App;
