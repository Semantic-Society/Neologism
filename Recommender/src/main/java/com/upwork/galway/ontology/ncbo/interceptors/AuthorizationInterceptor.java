package org.fit.neologism.recommender.ontology.ncbo.interceptors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthorizationInterceptor implements ClientHttpRequestInterceptor {

    @Value("${bioontology.apiKey}")
    private String API_KEY;

    @Override
    public ClientHttpResponse intercept(HttpRequest httpRequest, byte[] bytes, ClientHttpRequestExecution clientHttpRequestExecution) throws IOException {
        final HttpHeaders httpHeaders = httpRequest.getHeaders();

        if(!httpHeaders.containsKey(HttpHeaders.AUTHORIZATION))
            httpHeaders.set(HttpHeaders.AUTHORIZATION, "apikey token=" + API_KEY);

        return clientHttpRequestExecution.execute(httpRequest, bytes);
    }
}
