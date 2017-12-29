package org.fit.neologism.recommender.ontology.ncbo.configurations;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.fit.neologism.recommender.ontology.ncbo.interceptors.AuthorizationInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Value("${ncbo.thread.core-pool}")
    private int corePoolSize;

    @Value("${ncbo.thread.max-pool}")
    private int maxPoolSize;

    @Value("${ncbo.queue.capacity}")
    private int queueCapacity;

    @Value("${ncbo.thread.timeout}")
    private int threadTimeout;

    @Autowired
    private AuthorizationInterceptor authorizationInterceptor;

    @Bean
    public RestTemplate getRestTemplate(RestTemplateBuilder restTemplateBuilder) {
        final RestTemplate restTemplate = restTemplateBuilder.requestFactory(new HttpComponentsClientHttpRequestFactory()).build();
        restTemplate.getInterceptors().add(this.authorizationInterceptor);

        return restTemplate;
    }

    @Bean
    public ObjectMapper getObjectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        return bCryptPasswordEncoder;
    }

    @Bean
    @Qualifier("ncboWSExecutor")
    public ThreadPoolTaskExecutor threadPoolTaskExecutor() {
        final ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        threadPoolTaskExecutor.setCorePoolSize(corePoolSize);
        threadPoolTaskExecutor.setMaxPoolSize(maxPoolSize);
        threadPoolTaskExecutor.setQueueCapacity(queueCapacity);
        threadPoolTaskExecutor.setKeepAliveSeconds(threadTimeout);
        threadPoolTaskExecutor.setThreadNamePrefix("NCBO-WS-");
        threadPoolTaskExecutor.initialize();

        return threadPoolTaskExecutor;
    }
}
