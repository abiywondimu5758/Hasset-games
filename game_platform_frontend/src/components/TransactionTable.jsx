/* eslint-disable react/prop-types */


const TransactionTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full  border" style={{ borderColor: '#1c6758' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="py-2 px-4 bg-[#1c6758] text-left text-xs font-semibold text-white uppercase tracking-wider border-b"
                style={{ borderColor: '#1c6758' }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-900/85">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-700">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="py-2 px-4 border-b text-xs text-gray-200"
                  style={{ borderColor: '#1c6758' }}
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