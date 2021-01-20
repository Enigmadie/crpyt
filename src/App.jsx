import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import cn from 'classnames';

const App = () => {
  const [currencies, setCurrencies] = useState([]);
  const [leftCurrency, setLeftCurrency] = useState({});
  const [rightCurrency, setRightCurrency] = useState({});
  const [hasLeftOptions, dropLeftOptions] = useState(false);
  const [hasRightOptions, dropRightOptions] = useState(false);

  useEffect(() => {
    (async function () {
      const res = await axios.get('https://api.changenow.io/v1/currencies?active=true');
      setCurrencies(res.data);
      setLeftCurrency(res.data[0]);
      setRightCurrency(res.data[1]);
    })();
  }, []);

  const formik = useFormik({
    initialValues: {
      leftCurrency,
      rightCurrency,
      email: '',
    },
    onSubmit: async ({ text, file }, { resetForm }) => {
      resetForm();
    }
  });

  const {
    values,
    handleSubmit,
    handleChange,
    isSubmitting,
  } = formik;

  const handleLeftCurrencyClick = () => {
    dropLeftOptions(!hasLeftOptions);
  };

  const handleRightCurrencyClick = () => {
    dropRightOptions(!hasRightOptions);
  };

  return (
    <div className="crypto-main">
      <h1>Crypto Exchange</h1>
      <p>Exchange fast and easy</p>
      <form className="crypto-form" onSubmit={handleSubmit}>
        <div className="currency-wrapper">
          <div>
            <input name="leftCurrency" type="text" onChange={handleChange} />
            <div className="selector-currency" onClick={handleLeftCurrencyClick}>
              <img src={leftCurrency.image} />
              <p>{leftCurrency.ticker}</p>
            </div>
            <div className="drop-down-currency" style={{ display: hasLeftOptions ? 'block' : 'none' }}>
              {currencies.map((el) => (<div>{el.ticker}</div>))}
            </div>
          </div>
          <img src="/images/swap.svg" />
          <div>
            <input name="rightCurrency" type="text" onChange={handleChange} />
            <div className="selector-currency" onClick={handleRightCurrencyClick}>
              <img src={rightCurrency.image} />
              <p>{rightCurrency.ticker}</p>
            </div>
            <div className="drop-down-currency" style={{ display: hasRightOptions ? 'block' : 'none' }}>
              {currencies.map((el) => (<div>{el.ticker}</div>))}
            </div>
          </div>
        </div>
        <div className="approval-wrapper">
          <label htmlFor="email">
          Your address
          <input name="email" type="email" onChange={handleChange} />
          </label>
          <button type="submit">Exchange</button>
          {isSubmitting && <div />}
        </div>
      </form>
    </div>
  );
};

export default App;
