/* eslint-disable react/prop-types */


const TransactionTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full  border" style={{ borderColor: '#20436F' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 px-4 bg-[#20436F] text-left text-xs font-semibold text-white uppercase tracking-wider border-b"
                style={{ borderColor: '#20436F' }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="">
          {data.map((item, index) => (
            <tr key={index} className={`${
                        index % 2 === 0 ? "bg-text/55" : "bg-text/85"
                      } hover:bg-text`}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="py-2 px-4 font-semibold text-xs text-gray-200"
                  style={{ borderColor: '#20436F' }}
                >
                  {col.render ? col.render(item[col.dataIndex], item) : item[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;