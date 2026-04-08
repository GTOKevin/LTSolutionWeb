module.exports = {
  logisticaApi: {
    input: {
      target: '../../Backend/LTSolution.API/swagger.json', // Adjust to actual swagger location
    },
    output: {
      mode: 'tags-split',
      target: 'src/shared/api/generated/logisticaApi.ts',
      schemas: 'src/shared/api/generated/models',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/shared/api/http.ts',
          name: 'httpClient',
        },
      },
    },
  },
};
